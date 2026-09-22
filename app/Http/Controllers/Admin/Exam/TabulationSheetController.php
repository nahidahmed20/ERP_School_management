<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\ExamMark;
use App\Models\Grade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TabulationSheetController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;
        $globalFilter = fn($q) => $campusId ? $q->where('campus_id', $campusId)->orWhereNull('campus_id') : $q;

        $examId = $request->exam_id;
        $classId = $request->class_id;
        $sectionId = $request->section_id;

        $subjects = [];
        $tabulationData = [];
        
        $schoolName = DB::table('settings')
            ->where('key', 'school_name')
            ->where($globalFilter)
            ->value('value') ?? config('app.name', 'IDEAL SCHOOL & COLLEGE');

        if ($examId && $classId && $sectionId) {
            $subjectIds = ExamMark::where('exam_id', $examId)
                                  ->where('school_class_id', $classId)
                                  ->where('section_id', $sectionId)
                                  ->pluck('subject_id')
                                  ->unique();

            $subjects = Subject::whereIn('id', $subjectIds)->get();

            $students = Student::where('status', true)
                ->where($filter)
                ->whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                    $q->where('class_id', $classId)->where('section_id', $sectionId)->where('is_current', true);
                })
                ->with(['currentEnrollment' => function($q) use ($classId, $sectionId) {
                    $q->where('class_id', $classId)->where('section_id', $sectionId);
                }])->get();

            $allMarks = ExamMark::where('exam_id', $examId)
                                ->where('school_class_id', $classId)
                                ->where('section_id', $sectionId)
                                ->get();

            $grades = Grade::orderByDesc('grade_point')->get();
            $totalSubjects = $subjects->count();

            foreach ($students as $student) {
                $studentMarks = $allMarks->where('student_id', $student->id);
                $totalMarksObtained = $studentMarks->sum('marks_obtained');
                $totalGradePoint = $studentMarks->sum('grade_point');
            
                $gpa = $totalSubjects > 0 ? ($totalGradePoint / $totalSubjects) : 0;
                $gpaFormatted = number_format($gpa, 2);

                $isFailed = $studentMarks->contains(function ($m) {
                    return $m->grade === 'F' || (float)$m->grade_point === 0.0;
                });

                if ($studentMarks->count() < $totalSubjects) {
                    $isFailed = true;
                }

                $finalGpa       = $isFailed ? '0.00' : $gpaFormatted;
                $finalGradeObj  = $grades->firstWhere('grade_point', '<=', (float)$finalGpa);
                $finalGrade     = $isFailed ? 'F' : ($finalGradeObj ? $finalGradeObj->name : 'N/A');

                $marksData = [];
                foreach ($subjects as $subject) {
                    $subMark = $studentMarks->where('subject_id', $subject->id)->first();
                    $marksData[$subject->id] = $subMark ? [
                        'obtained'  => $subMark->marks_obtained,
                        'grade'     => $subMark->grade,
                        'point'     => number_format((float)$subMark->grade_point, 2)
                    ] : null;
                }

                $tabulationData[] = [
                    'id'            => $student->id,
                    'name'          => trim($student->first_name . ' ' . $student->last_name),
                    'roll_no'       => $student->currentEnrollment->roll_no ?? 9999,
                    'admission_no'  => $student->admission_no,
                    'marks'         => $marksData,
                    'total_marks'   => $totalMarksObtained,
                    'gpa'           => $finalGpa,
                    'grade'         => $finalGrade,
                    'status'        => $isFailed ? 'Failed' : 'Passed'
                ];
            }

            usort($tabulationData, fn($a, $b) => $a['roll_no'] <=> $b['roll_no']);
        }

        return Inertia::render('Admin/Exams/TabulationSheet', [
            'schoolName'        => $schoolName, 
            'exams'             => Exam::where('is_active', true)->where($globalFilter)->orderByDesc('start_date')->get(),
            'classes'           => SchoolClass::with('sections')->where('is_active', true)->where($globalFilter)->orderBy('numeric_name')->get(),
            'subjects'          => $subjects,
            'tabulationData'    => $tabulationData,
            'filters'           => $request->only(['exam_id', 'class_id', 'section_id'])
        ]);
    }
}