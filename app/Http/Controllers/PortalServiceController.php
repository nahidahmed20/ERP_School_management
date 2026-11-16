<?php

namespace App\Http\Controllers;

use App\Models\{AttendanceCorrectionRequest, BookIssue, Exam, ExamMark, HelpdeskTicket, HostelAllocation, HomeworkSubmission, Invoice, LeaveType, LibraryReservation, OnlineExam, Payment, PaymentTransaction, StaffLeave, Student, StudentAttendance, StudentLeaveRequest, StudentProfileUpdateRequest, TransportAllocation};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\StudentLearningService;

class PortalServiceController extends Controller
{
    public function staff(Request $request)
    {
        $staff = $request->user()->staff;
        abort_unless($staff, 403, 'A linked staff account is required.');
        return Inertia::render('Portal/StaffServices', [
            'staff' => $staff->load('department:id,name','designation:id,name'),
            'leaveTypes' => LeaveType::where('is_active', true)->get(['id','name']),
            'leaves' => $staff->leaves()->with('leaveType:id,name')->latest()->get(),
            'payrolls' => $staff->payrolls()->latest('salary_month')->get(),
            'shifts' => DB::table('staff_shifts')->where('staff_id',$staff->id)->whereDate('shift_date','>=',today())->orderBy('shift_date')->get(),
            'documents' => DB::table('staff_documents')->where('staff_id',$staff->id)->latest()->get(),
        ]);
    }

    public function staffLeave(Request $request)
    {
        $staff = $request->user()->staff; abort_unless($staff, 403);
        $data = $request->validate(['leave_type_id'=>'required|exists:leave_types,id','start_date'=>'required|date','end_date'=>'required|date|after_or_equal:start_date','reason'=>'required|string|max:2000']);
        $data['staff_id']=$staff->id; $data['total_days']=Carbon::parse($data['start_date'])->diffInDays(Carbon::parse($data['end_date']))+1; $data['status']='pending';
        StaffLeave::create($data); return back()->with('success','Leave request submitted.');
    }

    public function parent(Request $request)
    {
        $guardian=$request->user()->guardian; abort_unless($guardian,403,'A linked guardian account is required.');
        $children=\App\Models\Student::where(fn($q)=>$q->where('guardian_id',$guardian->id)->orWhereHas('guardians',fn($x)=>$x->where('guardians.id',$guardian->id)))->with('currentEnrollment.schoolClass')->get();
        return Inertia::render('Portal/ParentServices',[
            'children'=>$children, 'messages'=>DB::table('guardian_messages')->where('guardian_id',$guardian->id)->latest()->get(),
            'studentAccounts'=>$children->map(fn (Student $student) => $this->parentStudentDetails($student))->values(),
            'meetings'=>DB::table('parent_teacher_meetings')->where('guardian_id',$guardian->id)->latest()->get(),
            'consents'=>DB::table('parent_consents')->where('guardian_id',$guardian->id)->latest()->get(),
            'invoices'=>Invoice::whereIn('student_id',$children->pluck('id'))->latest()->get(),
            'leaves'=>DB::table('student_leave_requests')->where('guardian_id',$guardian->id)->latest()->get(),
            'payments'=>Payment::whereIn('student_id',$children->pluck('id'))->latest('payment_date')->get(),
            'publishedExams'=>Exam::where('results_published',true)->latest()->get(['id','name']),
            'clearances'=>DB::table('student_clearances')->whereIn('student_id',$children->pluck('id'))->get(),
            'timeline'=>DB::table('guardian_communication_events')->where('guardian_id',$guardian->id)->latest()->take(100)->get(),
            'guardian'=>$guardian,
        ]);
    }

    private function parentStudentDetails(Student $student): array
    {
        $student->loadMissing(['currentEnrollment.schoolClass', 'currentEnrollment.section']);
        $userId = $student->user_id;
        $learning = app(StudentLearningService::class);
        $homework = $learning->homework($student)->with('subject:id,name')->latest('submission_date')->get();
        $submissions = HomeworkSubmission::where('student_id', $student->id)->get()->keyBy('homework_id');

        return [
            'id' => $student->id,
            'name' => trim($student->first_name.' '.$student->last_name),
            'admission_no' => $student->admission_no,
            'date_of_birth' => $student->date_of_birth,
            'gender' => $student->gender,
            'phone' => $student->phone,
            'email' => $student->email,
            'address' => $student->present_address,
            'class' => $student->currentEnrollment?->schoolClass?->name,
            'section' => $student->currentEnrollment?->section?->name,
            'learning' => $learning->overview($student),
            'homework' => $homework->map(fn ($item) => [
                'id' => $item->id, 'title' => $item->title, 'subject' => $item->subject?->name,
                'due' => $item->submission_date, 'description' => $item->description,
                'file_url' => $item->document_path ? $learning->downloadUrl($student, 'homework', $item->id) : null,
                'submission' => ($submission = $submissions->get($item->id)) ? [
                    'id' => $submission->id,
                    'status' => $submission->status,
                    'teacher_feedback' => $submission->teacher_feedback,
                    'marks_obtained' => $submission->marks_obtained,
                    'has_attachment' => (bool) $submission->attachment_path,
                ] : null,
            ])->values(),
            'attendance' => StudentAttendance::where('student_id', $student->id)->latest('attendance_date')->take(100)->get(['attendance_date', 'status', 'is_excused']),
            'attendanceCorrections' => AttendanceCorrectionRequest::where('student_id', $student->id)->latest()->get(),
            'leaves' => StudentLeaveRequest::where('student_id', $student->id)->latest()->get(),
            'invoices' => Invoice::with('feeGroup:id,name')->where('student_id', $student->id)->latest('invoice_date')->get(),
            'transactions' => PaymentTransaction::where('student_id', $student->id)->latest('transaction_date')->get(),
            'payments' => Payment::where('student_id', $student->id)->latest('payment_date')->get(),
            'results' => ExamMark::with(['exam:id,name,end_date,results_published', 'subject:id,name'])
                ->where('student_id', $student->id)->whereHas('exam', fn ($query) => $query->where('results_published', true))->latest('exam_id')->get(),
            'books' => $userId ? BookIssue::with('book:id,title')->where('user_id', $userId)->latest('issue_date')->get() : collect(),
            'reservations' => $userId ? LibraryReservation::with('book:id,title')->where('user_id', $userId)->latest()->get() : collect(),
            'transport' => $userId ? TransportAllocation::with('vehicle')->where('user_id', $userId)->where('is_active', true)->first() : null,
            'hostel' => $userId ? HostelAllocation::with('room')->where('user_id', $userId)->where('is_active', true)->first() : null,
            'tickets' => $userId ? HelpdeskTicket::where('user_id', $userId)->latest()->get() : collect(),
            'profileRequests' => StudentProfileUpdateRequest::where('student_id', $student->id)->latest()->get(),
            'clearances' => DB::table('student_clearances')->where('student_id', $student->id)->get(),
            'onlineExams' => OnlineExam::where('campus_id', $student->campus_id)
                ->where('school_class_id', $student->currentEnrollment?->class_id)
                ->where('is_published', true)->where('is_active', true)->with('subject:id,name')->orderBy('exam_date')->get(),
        ];
    }

    public function parentRequest(Request $request, string $service)
    {
        $guardian=$request->user()->guardian; abort_unless($guardian,403);
        $studentId=$request->validate(['student_id'=>'required|exists:students,id'])['student_id'];
        abort_unless(\App\Models\Student::where('id',$studentId)->where(fn($q)=>$q->where('guardian_id',$guardian->id)->orWhereHas('guardians',fn($x)=>$x->where('guardians.id',$guardian->id)))->exists(),403);
        if ($service==='message') {
            $data=$request->validate(['subject'=>'required|string|max:255','message'=>'required|string|max:3000']);
            DB::table('guardian_messages')->insert($data+['guardian_id'=>$guardian->id,'student_id'=>$studentId,'status'=>'open','created_at'=>now(),'updated_at'=>now()]);
        } elseif ($service==='meeting') {
            $data=$request->validate(['requested_at'=>'required|date|after:now','mode'=>'required|in:in_person,online,phone','agenda'=>'nullable|string|max:2000']);
            DB::table('parent_teacher_meetings')->insert($data+['campus_id'=>$guardian->campus_id,'guardian_id'=>$guardian->id,'student_id'=>$studentId,'status'=>'pending','created_at'=>now(),'updated_at'=>now()]);
        } elseif ($service==='leave') {
            $data=$request->validate(['start_date'=>'required|date','end_date'=>'required|date|after_or_equal:start_date','reason'=>'required|string|max:2000']);
            DB::table('student_leave_requests')->insert($data+['guardian_id'=>$guardian->id,'student_id'=>$studentId,'leave_type'=>'Parent requested','parent_status'=>'Approved','school_status'=>'Pending','created_at'=>now(),'updated_at'=>now()]);
        } else abort(404);
        DB::table('guardian_communication_events')->insert(['guardian_id'=>$guardian->id,'student_id'=>$studentId,'channel'=>$service,'direction'=>'inbound','subject'=>$data['subject']??ucfirst($service).' request','content'=>$data['message']??$data['agenda']??$data['reason']??'Request submitted','status'=>'submitted','created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Request submitted successfully.');
    }
}
