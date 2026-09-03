<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamMarkRevision;
use App\Models\ExamSchedule;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; 

class MarksController extends Controller
{
    public function index(Request $request)
    {
        $examId = $request->exam_id;
        $classId = $request->class_id;
        $sectionId = $request->section_id;
        $subjectId = $request->subject_id;
        $students = [];

        if ($examId && $classId && $subjectId) {
            $students = Student::with(['currentEnrollment' => function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) $q->where('section_id', $sectionId);
            }])
            ->whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) $q->where('section_id', $sectionId);
            })
            ->get()
            ->map(function ($student) use ($examId, $subjectId) {
                $mark = ExamMark::where('exam_id', $examId)
                                ->where('subject_id', $subjectId)
                                ->where('student_id', $student->id)
                                ->first();

                $student->marks_obtained = $mark ? $mark->marks_obtained : '';
                $student->note = $mark ? $mark->note : '';
                return $student;
            });
        }

        return Inertia::render('Admin/Exams/MarksEntry', [
            'exams' => Exam::latest()->get(),
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'subjects' => Subject::where('is_active', true)->get(),
            'students' => $students,
            'filters' => $request->only(['exam_id', 'class_id', 'section_id', 'subject_id'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.written_marks' => 'nullable|numeric|min:0',
            'marks.*.practical_marks' => 'nullable|numeric|min:0',
            'marks.*.viva_marks' => 'nullable|numeric|min:0',
            'marks.*.full_marks' => 'nullable|numeric|min:0',
            'marks.*.pass_marks' => 'nullable|numeric|min:0',
            'correction_reason' => 'nullable|string|max:1000',
        ]);

        $exam = Exam::findOrFail($request->exam_id);
        if ($exam->approval_status === 'locked' || $exam->results_published) {
            return back()->with('error', 'Result is locked/published. Reopen it before changing marks.');
        }

        $schedule = ExamSchedule::where('exam_id', $request->exam_id)
                                ->where('class_id', $request->class_id)
                                ->where('subject_id', $request->subject_id)
                                ->first();

        if (!$schedule) {
            return back()->with('error', 'দুঃখিত! এই ক্লাসের এই বিষয়ের জন্য এখনো কোনো পরীক্ষার রুটিন বা শিডিউল তৈরি করা হয়নি। তাই মার্কস এন্ট্রি করা যাবে না।');
        }

        $examDate = Carbon::parse($schedule->exam_date)->startOfDay();
        $today = Carbon::today();

        if ($examDate->gt($today)) {
            return back()->with('error', 'দুঃখিত! এই পরীক্ষাটি আগামী ' . $examDate->format('d M, Y') . ' তারিখে অনুষ্ঠিত হবে। পরীক্ষার তারিখের পূর্বে মার্কস এন্ট্রি করা যাবে না।');
        }

        $grades = Grade::all();

        foreach ($request->marks as $markData) {
            $components = collect(['written_marks','practical_marks','viva_marks'])->map(fn($key)=>(float)($markData[$key]??0));
            $marksObtained = $components->sum() > 0 ? $components->sum() : ($markData['marks_obtained'] ?? null);
            $gradeName = null;
            $gradePoint = null;

            if ($marksObtained !== null && $marksObtained !== '') {
                $assignedGrade = $grades->where('min_marks', '<=', $marksObtained)
                                        ->where('max_marks', '>=', $marksObtained)
                                        ->first();
                if ($assignedGrade) {
                    $gradeName = $assignedGrade->name;
                    $gradePoint = $assignedGrade->grade_point;
                }
            }

            $identity = [
                    'exam_id' => $request->exam_id,
                    'subject_id' => $request->subject_id,
                    'student_id' => $markData['student_id'],
                ];
            $values = [
                    'school_class_id' => $request->class_id,
                    'section_id' => $request->section_id ?? null,
                    'marks_obtained' => $marksObtained !== '' ? $marksObtained : null,
                    'grade' => $gradeName,
                    'grade_point' => $gradePoint,
                    'note' => $markData['note'] ?? null,
                    'written_marks' => $markData['written_marks'] ?? null,
                    'practical_marks' => $markData['practical_marks'] ?? null,
                    'viva_marks' => $markData['viva_marks'] ?? null,
                    'full_marks' => $markData['full_marks'] ?? null,
                    'pass_marks' => $markData['pass_marks'] ?? null,
                ];
            $existing = ExamMark::where($identity)->first();
            if ($existing && collect($values)->contains(fn($value,$key)=>(string)$existing->{$key} !== (string)$value)) {
                if (! $request->filled('correction_reason')) return back()->withErrors(['correction_reason'=>'A correction reason is required when changing existing marks.']);
                $old = $existing->only(array_keys($values));
                $existing->update($values);
                ExamMarkRevision::create(['exam_mark_id'=>$existing->id]+$identity+['old_values'=>$old,'new_values'=>$existing->fresh()->only(array_keys($values)),'reason'=>$request->correction_reason,'changed_by'=>$request->user()->id]);
            } elseif (! $existing) {
                ExamMark::create($identity+$values);
            }
        }

        return back()->with('success', 'মার্কস সফলভাবে সেভ করা হয়েছে!');
    }

    public function destroy(Request $request)
    {
        $exam = Exam::findOrFail($request->exam_id);
        if ($exam->approval_status === 'locked' || $exam->results_published) return back()->with('error','Locked/published marks cannot be deleted.');
        $query = ExamMark::where('exam_id', $request->exam_id)
                         ->where('school_class_id', $request->class_id)
                         ->where('subject_id', $request->subject_id);

        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }

        $query->delete();

        return back()->with('success', 'এই বিষয়ের সমস্ত মার্কস মুছে ফেলা (Delete) হয়েছে!');
    }

    public function examsReportcards(Request $request)
    {
        $examId = $request->exam_id;
        $classId = $request->class_id;
        $sectionId = $request->section_id;
        $studentId = $request->student_id;

        $students = [];
        $reportCard = null;

        if ($classId) {
            $students = Student::whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) {
                    $q->where('section_id', $sectionId);
                }
            })->get();
        }

        if ($examId && $classId && $studentId) {
            $student = Student::with(['currentEnrollment.schoolClass', 'currentEnrollment.section'])->findOrFail($studentId);

            $marks = ExamMark::where('exam_id', $examId)
                             ->where('school_class_id', $classId)
                             ->where('student_id', $studentId)
                             ->with('subject')
                             ->get();

            $totalMarksObtained = $marks->sum('marks_obtained');
            $totalSubjects = $marks->count();

            $totalGradePoint = $marks->sum('grade_point');
            $gpa = $totalSubjects > 0 ? number_format($totalGradePoint / $totalSubjects, 2) : 0.00;

            $grades = Grade::all();
            $finalGrade = $grades->where('grade_point', '<=', $gpa)->sortByDesc('grade_point')->first();

            $isFailed = $marks->contains(function ($m) {
                return $m->grade === 'F' || $m->marks_obtained < 33;
            });

            $reportCard = [
                'student' => $student,
                'marks' => $marks,
                'total_marks' => $totalMarksObtained,
                'gpa' => $isFailed ? '0.00' : $gpa,
                'letter_grade' => $isFailed ? 'F' : ($finalGrade ? $finalGrade->name : 'N/A'),
                'status' => $isFailed ? 'Failed' : 'Passed',
            ];
        }

        return Inertia::render('Admin/Exams/ReportCards', [
            'exams' => Exam::latest()->get(),
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'students' => $students,
            'reportCard' => $reportCard,
            'filters' => $request->only(['exam_id', 'class_id', 'section_id', 'student_id'])
        ]);
    }
}
