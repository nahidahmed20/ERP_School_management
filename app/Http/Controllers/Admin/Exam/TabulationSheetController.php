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

class TabulationSheetController extends Controller
{
    public function index(Request $request)
    {
        $examId = $request->exam_id;
        $classId = $request->class_id;
        $sectionId = $request->section_id;

        $subjects = [];
        $tabulationData = [];
        $examInfo = null;

        if ($examId && $classId && $sectionId) {
            $examInfo = Exam::find($examId);
            $classInfo = SchoolClass::with('sections')->find($classId);
            $sectionInfo = $classInfo->sections->where('id', $sectionId)->first();

            $subjectIds = ExamMark::where('exam_id', $examId)
                                  ->where('school_class_id', $classId)
                                  ->where('section_id', $sectionId)
                                  ->pluck('subject_id')
                                  ->unique();

            $subjects = Subject::whereIn('id', $subjectIds)->get();

            $students = Student::whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId)->where('section_id', $sectionId);
            })->with('currentEnrollment')->get();

            $allMarks = ExamMark::where('exam_id', $examId)
                                ->where('school_class_id', $classId)
                                ->where('section_id', $sectionId)
                                ->get();

            $grades = Grade::all();
            $totalSubjects = $subjects->count();

            foreach ($students as $student) {
                $studentMarks = $allMarks->where('student_id', $student->id);
                $totalMarksObtained = $studentMarks->sum('marks_obtained');

                $totalGradePoint = $studentMarks->sum('grade_point');
            
                $gpa = $totalSubjects > 0 ? number_format($totalGradePoint / $totalSubjects, 2) : 0.00;

                $isFailed = $studentMarks->contains(function ($m) {
                    return $m->grade === 'F' || $m->marks_obtained < 33;
                });

                if ($studentMarks->count() < $totalSubjects) {
                    $isFailed = true;
                }

                $finalGpa       = $isFailed ? '0.00' : $gpa;
                $finalGradeObj  = $grades->where('grade_point', '<=', $finalGpa)->sortByDesc('grade_point')->first();
                $finalGrade     = $isFailed ? 'F' : ($finalGradeObj ? $finalGradeObj->name : 'N/A');

                $marksData = [];
                foreach ($subjects as $subject) {
                    $subMark = $studentMarks->where('subject_id', $subject->id)->first();
                    $marksData[$subject->id] = $subMark ? [
                        'obtained'  => $subMark->marks_obtained,
                        'grade'     => $subMark->grade,
                        'point'     => $subMark->grade_point
                    ] : null;
                }

                $tabulationData[] = [
                    'id'            => $student->id,
                    'name'          => $student->first_name . ' ' . $student->last_name,
                    'roll_no'       => $student->current_enrollment->roll_no ?? 9999,
                    'admission_no'  => $student->admission_no,
                    'marks'         => $marksData,
                    'total_marks'   => $totalMarksObtained,
                    'gpa'           => $finalGpa,
                    'grade'         => $finalGrade,
                    'status'        => $isFailed ? 'Failed' : 'Passed'
                ];
            }

            usort($tabulationData, function($a, $b) {
                return $a['roll_no'] <=> $b['roll_no'];
            });
        }

        return Inertia::render('Admin/Exams/TabulationSheet', [
            'exams'             => Exam::latest()->get(),
            'classes'           => SchoolClass::with('sections')->where('is_active', true)->get(),
            'subjects'          => $subjects,
            'tabulationData'    => $tabulationData,
            'filters'           => $request->only(['exam_id', 'class_id', 'section_id'])
        ]);
    }
}
