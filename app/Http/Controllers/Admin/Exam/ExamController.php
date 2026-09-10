<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\{Enrollment, ExamMark};
use Illuminate\Validation\ValidationException;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $query = Exam::query()->orderBy('start_date', 'desc');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $query->paginate(\App\Support\PerPage::resolve(15))->withQueryString(),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['results_published'] = false;
        $data['results_published_at'] = null;
        Exam::create($data);

        return back()->with('success', 'পরীক্ষা সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $data = $this->validateData($request);
        DB::transaction(function () use ($id, $data) {
            $exam = Exam::whereKey($id)->lockForUpdate()->firstOrFail();
            $exam->update($data);
        });

        return back()->with('success', 'পরীক্ষার তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);

        if ($exam->results_published || $exam->approval_status !== 'draft' || $exam->schedules()->exists() || ExamMark::where('exam_id', $exam->id)->exists()) {
            return back()->with('error', 'Only draft exams without schedules or marks can be deleted.');
        }

        try {
            $exam->delete();
        } catch (QueryException $e) {
            return back()->with('error', 'এই পরীক্ষার সাথে শিডিউল বা অন্য তথ্য যুক্ত আছে, তাই ডিলিট করা যাচ্ছে না। আগে সংশ্লিষ্ট শিডিউল মুছে ফেলুন।');
        }

        return back()->with('success', 'পরীক্ষা মুছে ফেলা হয়েছে।');
    }

    public function workflow(Request $request, Exam $exam)
    {
        $data = $request->validate(['action' => ['required', Rule::in(['submit','approve','lock','reopen'])]]);
        $exam=DB::transaction(function()use($exam,$data,$request){$exam=Exam::whereKey($exam->id)->lockForUpdate()->firstOrFail();
        abort_if($exam->approval_status === 'locked' && $data['action'] !== 'reopen', 422, 'The result is locked.');
        $allowed=['draft'=>['submit'],'submitted'=>['approve'],'approved'=>['lock'],'locked'=>['reopen']];
        abort_unless(in_array($data['action'],$allowed[$exam->approval_status]??[],true),422,'Invalid result workflow transition.');
        abort_if($data['action']==='approve' && (int)$exam->submitted_by===(int)$request->user()->id,403,'Submitter cannot approve their own result.');
        if (in_array($data['action'], ['submit', 'lock'], true)) $this->ensureCompleteResults($exam);
        $updates = match ($data['action']) {
            'submit' => ['approval_status'=>'submitted','submitted_by'=>$request->user()->id],
            'approve' => ['approval_status'=>'approved','approved_by'=>$request->user()->id,'approved_at'=>now()],
            'lock' => ['approval_status'=>'locked','locked_at'=>now(),'results_published'=>true,'results_published_at'=>now()],
            'reopen' => ['approval_status'=>'draft','submitted_by'=>null,'approved_by'=>null,'approved_at'=>null,'locked_at'=>null,'results_published'=>false,'results_published_at'=>null],
        };
        $exam->update($updates);
        return $exam;});
        return back()->with('success', 'Result workflow updated.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }

    private function ensureCompleteResults(Exam $exam): void
    {
        $schedules = $exam->schedules()->get();
        if ($schedules->isEmpty()) {
            throw ValidationException::withMessages(['exam_id' => 'Add the exam schedule and marks before submitting results.']);
        }
        foreach ($schedules as $schedule) {
            $students = Enrollment::where('class_id', $schedule->class_id)->where('section_id', $schedule->section_id)
                ->where('is_current', true)->whereHas('student', fn ($q) => $q->where('status', true))->pluck('student_id');
            $marked = ExamMark::where('exam_id', $exam->id)->where('school_class_id', $schedule->class_id)
                ->where('section_id', $schedule->section_id)->where('subject_id', $schedule->subject_id)
                ->whereNotNull('marks_obtained')->whereNotNull('grade_point')->pluck('student_id');
            if ($students->isEmpty() || $students->diff($marked)->isNotEmpty()) {
                throw ValidationException::withMessages(['exam_id' => 'Enter marks (including zero for absent students) for every active student and scheduled subject before publishing.']);
            }
        }
    }
}
