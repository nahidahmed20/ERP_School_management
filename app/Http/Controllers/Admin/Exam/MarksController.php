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
use App\Support\CampusRule;
use App\Models\Enrollment;
use App\Services\ExamResultService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            ->where('status', true)
            ->get()
            ->map(function ($student) use ($examId, $subjectId) {
                $mark = ExamMark::where('exam_id', $examId)
                                ->where('subject_id', $subjectId)
                                ->where('student_id', $student->id)
                                ->first();

                $student->marks_obtained = $mark ? $mark->marks_obtained : '';
                $student->note = $mark ? $mark->note : '';
                $student->full_marks = $mark?->full_marks ?? 100;
                $student->pass_marks = $mark?->pass_marks ?? 33;
                foreach (['written_marks', 'practical_marks', 'viva_marks'] as $component) $student->$component = $mark?->$component;
                return $student;
            });
        }

        return Inertia::render('Admin/Exams/MarksEntry', [
            'exams' => Exam::latest()->get(),
            'classes' => SchoolClass::with(['sections', 'subjects'])->where('is_active', true)->get(),
            'subjects' => Subject::where('is_active', true)->get(),
            'students' => $students,
            'filters' => $request->only(['exam_id', 'class_id', 'section_id', 'subject_id'])
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'exam_id' => ['required', CampusRule::exists('exams')],
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'section_id' => ['nullable', CampusRule::exists('sections')],
            'subject_id' => ['required', CampusRule::exists('subjects')],
            'marks' => 'required|array|min:1',
            'marks.*.student_id' => ['required', 'distinct', CampusRule::exists('students')],
            'marks.*.marks_obtained' => 'nullable|numeric|min:0|max:999.99',
            'marks.*.written_marks' => 'nullable|numeric|min:0|max:999.99',
            'marks.*.practical_marks' => 'nullable|numeric|min:0|max:999.99',
            'marks.*.viva_marks' => 'nullable|numeric|min:0|max:999.99',
            'marks.*.full_marks' => 'nullable|numeric|gt:0|max:999.99',
            'marks.*.pass_marks' => 'nullable|numeric|min:0|max:999.99',
            'marks.*.note' => 'nullable|string|max:255',
            'correction_reason' => 'nullable|string|max:1000',
        ]);
        $class = SchoolClass::findOrFail($data['class_id']);
        if (! empty($data['section_id']) && ! $class->sections()->whereKey($data['section_id'])->exists()) {
            throw ValidationException::withMessages(['section_id' => 'Select a section assigned to this class.']);
        }

        DB::transaction(function () use ($data, $request) {
            $exam = Exam::whereKey($data['exam_id'])->lockForUpdate()->firstOrFail();
            if ($exam->approval_status !== 'draft' || $exam->results_published) {
                throw ValidationException::withMessages(['exam_id' => 'Reopen the result for correction before changing marks.']);
            }

            $enrollments = Enrollment::where('class_id', $data['class_id'])->where('is_current', true)
                ->when(! empty($data['section_id']), fn ($q) => $q->where('section_id', $data['section_id']))
                ->whereIn('student_id', collect($data['marks'])->pluck('student_id'))
                ->whereHas('student', fn ($q) => $q->where('status', true))
                ->get()->keyBy('student_id');
            $schedules = ExamSchedule::where('exam_id', $exam->id)->where('class_id', $data['class_id'])
                ->where('subject_id', $data['subject_id'])->get()->keyBy('section_id');
            $grades = Grade::orderByDesc('min_marks')->get();
            foreach ($data['marks'] as $index => $row) {
                $enrollment = $enrollments->get($row['student_id']);
                if (! $enrollment) {
                    throw ValidationException::withMessages(["marks.$index.student_id" => 'Student is not currently enrolled in the selected class and section.']);
                }
                $schedule = $schedules->get($enrollment->section_id);
                if (! $schedule || Carbon::parse($schedule->exam_date)->startOfDay()->isFuture()) {
                    throw ValidationException::withMessages(['subject_id' => 'Marks require a scheduled exam on or before today for every selected section.']);
                }
                $identity = ['exam_id' => $exam->id, 'subject_id' => $data['subject_id'], 'student_id' => $row['student_id']];
                $existing = ExamMark::where($identity)->first();
                $full = (float) ($row['full_marks'] ?? $existing?->full_marks ?? 100);
                $pass = (float) ($row['pass_marks'] ?? $existing?->pass_marks ?? ($full * .33));
                $hasComponents = collect(['written_marks', 'practical_marks', 'viva_marks'])
                    ->contains(fn ($key) => isset($row[$key]) && $row[$key] !== '');
                $obtained = $hasComponents
                    ? collect(['written_marks', 'practical_marks', 'viva_marks'])->sum(fn ($key) => (float) ($row[$key] ?? 0))
                    : ($row['marks_obtained'] ?? null);
                if ($pass > $full || ($obtained !== null && (float) $obtained > $full)) {
                    throw ValidationException::withMessages(["marks.$index.marks_obtained" => 'Obtained marks and pass marks cannot exceed full marks.']);
                }
                $grade = $obtained === null ? null : $grades->first(fn ($grade) =>
                    (float) $grade->min_marks <= ((float) $obtained / $full * 100)
                    && (float) $grade->max_marks >= ((float) $obtained / $full * 100));
                if ($obtained !== null && ! $grade) {
                    throw ValidationException::withMessages(["marks.$index.marks_obtained" => 'Configure a grade range covering this percentage before saving marks.']);
                }
                $values = [
                    'school_class_id' => $data['class_id'], 'section_id' => $enrollment->section_id,
                    'marks_obtained' => $obtained, 'grade' => $obtained !== null && $obtained < $pass ? 'F' : $grade?->name,
                    'grade_point' => $obtained !== null && $obtained < $pass ? 0 : $grade?->grade_point,
                    'note' => $row['note'] ?? null, 'full_marks' => $full, 'pass_marks' => $pass,
                    'written_marks' => $hasComponents ? ($row['written_marks'] ?? null) : null,
                    'practical_marks' => $hasComponents ? ($row['practical_marks'] ?? null) : null,
                    'viva_marks' => $hasComponents ? ($row['viva_marks'] ?? null) : null,
                ];
                if ($existing) {
                    $oldValues = $existing->only(array_keys($values));
                    $existing->fill($values);
                    if ($existing->isDirty()) {
                        if (empty(trim($data['correction_reason'] ?? ''))) {
                            throw ValidationException::withMessages(['correction_reason' => 'A correction reason is required when changing existing marks.']);
                        }
                        $existing->save();
                        ExamMarkRevision::create($identity + [
                            'exam_mark_id' => $existing->id, 'old_values' => $oldValues,
                            'new_values' => $existing->fresh()->only(array_keys($values)),
                            'reason' => $data['correction_reason'], 'changed_by' => $request->user()->id,
                        ]);
                    }
                } else {
                    ExamMark::create($identity + $values);
                }
            }
        });
        return back()->with('success', 'Marks saved successfully.');
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'exam_id' => ['required', CampusRule::exists('exams')],
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'section_id' => ['nullable', CampusRule::exists('sections')],
            'subject_id' => ['required', CampusRule::exists('subjects')],
        ]);
        DB::transaction(function () use ($data) {
            $exam = Exam::whereKey($data['exam_id'])->lockForUpdate()->firstOrFail();
            if ($exam->approval_status !== 'draft' || $exam->results_published) {
                throw ValidationException::withMessages(['exam_id' => 'Only draft marks can be cleared.']);
            }
            ExamMark::where('exam_id', $exam->id)->where('school_class_id', $data['class_id'])
                ->where('subject_id', $data['subject_id'])
                ->when(! empty($data['section_id']), fn ($q) => $q->where('section_id', $data['section_id']))->delete();
        });
        return back()->with('success', 'Marks cleared for the selected subject.');
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

            $expectedSubjects = ExamSchedule::where('exam_id', $examId)->where('class_id', $classId)
                ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
                ->distinct()->count('subject_id');
            $reportCard = ['student' => $student, 'marks' => $marks]
                + app(ExamResultService::class)->summary($marks, $expectedSubjects);
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
