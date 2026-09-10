<?php

namespace App\Http\Controllers;

use App\Models\{AttendanceCorrectionRequest, Book, BookIssue, HelpdeskTicket, Homework, HomeworkSubmission, HostelAllocation, Invoice, LibraryReservation, OnlineExam, OnlineExamAnswer, PaymentTransaction, QuizAttempt, StudentAttendance, StudentLeaveRequest, StudentProfileUpdateRequest, StudentTaskCompletion, TransportAllocation};
use App\Services\MalwareScanner;
use App\Services\StudentLearningService;
use App\Models\Payment;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Support\CampusRule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentPortalController extends Controller
{
    public function index(Request $request): Response
    {
        [$student, $enrollment] = $this->student($request);
        $user = $request->user();
        $learning = app(StudentLearningService::class);
        $homework = $learning->homework($student)->with('subject:id,name')->latest('submission_date')->get();
        $submissions = HomeworkSubmission::where('student_id', $student->id)->get()->keyBy('homework_id');

        return Inertia::render('Portal/StudentServices', [
            'learning' => $learning->overview($student),
            'canViewResults' => $user->can('portal.results.view'),
            'canAttemptExams' => $user->can('portal.exams.attempt'),
            'payments' => Payment::where('student_id', $student->id)->latest('payment_date')->get(['id', 'amount_paid', 'payment_date', 'refunded_amount']),
            'homework' => $homework->map(fn ($item) => [
                'id'=>$item->id,'title'=>$item->title,'subject'=>$item->subject?->name,'description'=>$item->description,
                'due'=>$item->submission_date,'total_marks'=>$item->total_marks,'submission'=>$submissions->get($item->id),
                'document_url'=>$item->document_path ? $learning->downloadUrl($student, 'homework', $item->id) : null,
            ]),
            'leaves' => StudentLeaveRequest::where('student_id',$student->id)->latest()->get(),
            'attendance' => StudentAttendance::where('student_id',$student->id)->latest('attendance_date')->take(60)->get(),
            'corrections' => AttendanceCorrectionRequest::where('student_id',$student->id)->latest()->get(),
            'invoices' => Invoice::with('feeGroup:id,name')->where('student_id',$student->id)->latest('invoice_date')->get(),
            'transactions' => PaymentTransaction::where('student_id',$student->id)->latest('transaction_date')->get(),
            'books' => BookIssue::with('book:id,title')->where('user_id',$user->id)->latest('issue_date')->get(),
            'availableBooks' => Book::where('available','>',0)->orderBy('title')->get(['id','title','author']),
            'reservations' => LibraryReservation::with('book:id,title')->where('user_id',$user->id)->latest()->get(),
            'transport' => TransportAllocation::with('vehicle')->where('user_id',$user->id)->where('is_active',true)->first(),
            'hostel' => HostelAllocation::with('room')->where('user_id',$user->id)->where('is_active',true)->first(),
            'tickets' => HelpdeskTicket::where('user_id',$user->id)->latest()->get(),
            'profileRequests' => StudentProfileUpdateRequest::where('student_id',$student->id)->latest()->get(),
            'onlineExams' => OnlineExam::where('campus_id', $student->campus_id)->where('school_class_id',$enrollment?->class_id)->when(! $enrollment, fn ($query) => $query->whereRaw('1 = 0'))->where('is_published',true)->where('is_active',true)
                ->with('subject:id,name')->orderBy('exam_date')->get()->map(function($exam)use($user){$attempt=QuizAttempt::where('online_exam_id',$exam->id)->where('student_id',$user->id)->first();return ['id'=>$exam->id,'title'=>$exam->title,'subject'=>$exam->subject,'exam_date'=>$exam->exam_date,'duration_minutes'=>$exam->duration_minutes,'total_marks'=>$exam->total_marks,'attempt'=>$attempt];}),
        ]);
    }

    public function submitHomework(Request $request, Homework $homework, MalwareScanner $scanner)
    {
        [$student, $enrollment] = $this->student($request);
        abort_unless((int)$homework->school_class_id === (int)$enrollment?->class_id, 403);
        $data=$request->validate(['answer'=>'nullable|string|max:10000','attachment'=>'nullable|file|max:10240']);
        if (!$request->filled('answer') && !$request->hasFile('attachment')) throw ValidationException::withMessages(['answer'=>'Answer অথবা file দিন।']);
        $path=null;
        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            $path=$request->file('attachment')->store('student/homework-submissions/'.config('app.active_campus_id'),'local');
        }
        HomeworkSubmission::updateOrCreate(['homework_id'=>$homework->id,'student_id'=>$student->id],[
            'answer'=>$data['answer']??null,'attachment_path'=>$path,'submitted_at'=>now(),
            'status'=>now()->startOfDay()->gt($homework->submission_date)?'Late':'Submitted',
        ]);
        return back()->with('success','Homework submitted successfully.');
    }

    public function leave(Request $request, MalwareScanner $scanner)
    {
        [$student]=$this->student($request); $data=$request->validate([
            'leave_type'=>'required|string|max:100','start_date'=>'required|date','end_date'=>'required|date|after_or_equal:start_date',
            'reason'=>'required|string|max:3000','attachment'=>'nullable|file|max:5120']);
        $data['student_id']=$student->id; $data['attachment_path']=null;
        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            $data['attachment_path']=$request->file('attachment')->store('student/leave-attachments/'.config('app.active_campus_id'),'local');
        }
        unset($data['attachment']);
        StudentLeaveRequest::create($data); return back()->with('success','Leave application submitted.');
    }

    public function downloadHomeworkSubmission(Request $request, HomeworkSubmission $submission)
    {
        [$student]=$this->student($request);
        abort_unless((int)$submission->student_id === (int)$student->id, 403);
        return $this->privateDownload($submission->attachment_path);
    }

    public function downloadLeaveAttachment(Request $request, StudentLeaveRequest $leave)
    {
        [$student]=$this->student($request);
        abort_unless((int)$leave->student_id === (int)$student->id, 403);
        return $this->privateDownload($leave->attachment_path);
    }

    public function attendanceCorrection(Request $request)
    {
        [$student]=$this->student($request); $data=$request->validate(['attendance_date'=>'required|date|before_or_equal:today','requested_status'=>'required|in:present,absent,late,half_day,leave','reason'=>'required|string|max:2000']);
        $current=StudentAttendance::where('student_id',$student->id)->whereDate('attendance_date',$data['attendance_date'])->value('status');
        AttendanceCorrectionRequest::updateOrCreate(['student_id'=>$student->id,'attendance_date'=>$data['attendance_date']],$data+['campus_id'=>$student->campus_id,'current_status'=>$current,'status'=>'Pending','reviewed_by'=>null,'review_note'=>null]);
        return back()->with('success','Attendance correction request submitted.');
    }

    public function profileUpdate(Request $request)
    {
        [$student]=$this->student($request); $data=$request->validate(['phone'=>'nullable|string|max:30','email'=>'nullable|email|max:255','present_address'=>'nullable|string|max:1000','permanent_address'=>'nullable|string|max:1000','reason'=>'nullable|string|max:1000']);
        $changes=collect($data)->except('reason')->filter(fn($value,$key)=>$value!==null && $value!=='' && $value!==(string)$student->{$key})->all();
        if (!$changes) throw ValidationException::withMessages(['phone'=>'কোনো পরিবর্তন পাওয়া যায়নি।']);
        StudentProfileUpdateRequest::create(['student_id'=>$student->id,'changes'=>$changes,'reason'=>$data['reason']??null]);
        return back()->with('success','Profile update request submitted.');
    }

    public function toggleTask(Request $request)
    {
        [$student]=$this->student($request); $data=$request->validate(['task_type'=>'required|in:homework','task_id'=>'required|integer']);
        $task=StudentTaskCompletion::firstOrCreate(['student_id'=>$student->id]+$data);
        $task->update(['completed_at'=>$task->completed_at?null:now()]); return back();
    }

    public function reserveBook(Request $request)
    {
        $this->student($request); $data=$request->validate(['book_id'=>'required|exists:books,id','note'=>'nullable|string|max:500']);
        LibraryReservation::firstOrCreate(['book_id'=>$data['book_id'],'user_id'=>$request->user()->id,'status'=>'Pending'],['requested_at'=>today(),'note'=>$data['note']??null]);
        return back()->with('success','Book reservation requested.');
    }

    public function ticket(Request $request)
    {
        $this->student($request); $data=$request->validate(['subject'=>'required|string|max:255','description'=>'required|string|max:3000','priority'=>'required|in:Low,Medium,High,Urgent']);
        HelpdeskTicket::create($data+['campus_id'=>$request->user()->campus_id,'user_id'=>$request->user()->id,'ticket_number'=>'STU-'.now()->format('ymdHis').'-'.$request->user()->id,'requester_name'=>$request->user()->name,'requester_type'=>'Student']);
        return back()->with('success','Support request submitted.');
    }

    public function paymentRequest(Request $request, Invoice $invoice)
    {
        [$student]=$this->student($request); abort_unless((int)$invoice->student_id===(int)$student->id,403);
        $due=max(0,(float)$invoice->amount+(float)$invoice->fine-(float)$invoice->discount-(float)$invoice->paid_amount);
        $data=$request->validate(['amount'=>['required','numeric','min:1','max:'.$due],'payment_method'=>'required|string|max:100']);
        PaymentTransaction::create(['transaction_id'=>'PAYREQ-'.now()->format('YmdHis').'-'.$student->id.'-'.strtoupper(str()->random(4)),'reference_no'=>$invoice->invoice_no,'amount'=>$data['amount'],'currency'=>'BDT','payment_method'=>$data['payment_method'],'status'=>'Pending','transaction_date'=>today(),'source_type'=>Invoice::class,'source_id'=>$invoice->id,'student_id'=>$student->id,'note'=>'Student payment request; awaiting gateway/admin confirmation.']);
        return back()->with('success','Payment request created.');
    }

    public function startExam(Request $request, OnlineExam $exam): Response
    {
        [$student,$enrollment]=$this->student($request); abort_unless((int)$exam->school_class_id===(int)$enrollment?->class_id && $exam->is_published && $exam->is_active,403);
        abort_unless(now()->toDateString()===$exam->exam_date?->toDateString(),403,'Exam is not available today.');
        abort_if(now()->format('H:i:s') < $exam->start_time || now()->format('H:i:s') > $exam->end_time,403,'Exam is outside the scheduled time.');
        $attempt=QuizAttempt::firstOrCreate(['online_exam_id'=>$exam->id,'student_id'=>$request->user()->id],[
            'campus_id'=>$student->campus_id,'attempt_date'=>today(),'started_at'=>now(),'status'=>'Pending Evaluation']);
        abort_if($attempt->submitted_at,403,'Exam already submitted.');
        $exam->load(['subject:id,name','questions.question']);
        return Inertia::render('Portal/OnlineExam',[
            'exam'=>['id'=>$exam->id,'title'=>$exam->title,'subject'=>$exam->subject?->name,'duration'=>$exam->duration_minutes,'total_marks'=>$exam->total_marks,'started_at'=>$attempt->started_at,'questions'=>$exam->questions->map(fn($link)=>['id'=>$link->question->id,'type'=>$link->question->question_type,'question'=>$link->question->question,'options'=>array_filter(['a'=>$link->question->option_a,'b'=>$link->question->option_b,'c'=>$link->question->option_c,'d'=>$link->question->option_d]),'marks'=>$link->question->marks])],
        ]);
    }

    public function submitExam(Request $request, OnlineExam $exam)
    {
        [$student,$enrollment]=$this->student($request); abort_unless((int)$exam->school_class_id===(int)$enrollment?->class_id,403);
        $attempt=QuizAttempt::where('online_exam_id',$exam->id)->where('student_id',$request->user()->id)->lockForUpdate()->firstOrFail();
        abort_if($attempt->submitted_at,422,'Already submitted.');
        if (now()->gt($attempt->started_at->copy()->addMinutes($exam->duration_minutes+2))) throw ValidationException::withMessages(['exam'=>'Exam time expired.']);
        $answers=$request->validate(['answers'=>'array','answers.*'=>'nullable|string'])['answers']??[]; $total=0; $needsReview=false;
        DB::transaction(function()use($exam,$attempt,$answers,&$total,&$needsReview){
            $exam->load('questions.question'); foreach($exam->questions as $link){$q=$link->question;$answer=$answers[$q->id]??null;$auto=in_array(strtolower($q->question_type),['mcq','true/false']);$correct=$auto?strtolower(trim((string)$answer))===strtolower(trim((string)$q->correct_answer)):null;$marks=$correct?(float)$q->marks:($auto?0:null);if(!$auto)$needsReview=true;if($marks)$total+=$marks;OnlineExamAnswer::updateOrCreate(['quiz_attempt_id'=>$attempt->id,'question_bank_id'=>$q->id],['answer'=>$answer,'is_correct'=>$correct,'awarded_marks'=>$marks]);}
            $attempt->update(['submitted_at'=>now(),'obtained_marks'=>$total,'status'=>$needsReview?'Pending Evaluation':($total>=(float)$exam->passing_marks?'Passed':'Failed')]);
        });
        return redirect()->route('portal.services')->with('success','Exam submitted successfully.');
    }

    private function student(Request $request): array
    {
        $student=$request->user()->student()->with('currentEnrollment')->first(); abort_unless($student,403,'Student profile is not linked.');
        return [$student,$student->currentEnrollment];
    }

    private function privateDownload(?string $path)
    {
        abort_unless($path && Storage::disk('local')->exists($path), 404);
        return Storage::disk('local')->download($path, basename($path), [
            'X-Content-Type-Options'=>'nosniff', 'Cache-Control'=>'private, no-store, max-age=0',
        ]);
    }
}
