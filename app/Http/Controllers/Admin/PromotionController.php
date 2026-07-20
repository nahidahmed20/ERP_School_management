<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $students = [];

        if ($request->filled(['current_session_id', 'current_class_id', 'current_section_id'])) {
            $students = Enrollment::with('student')
                ->where('academic_session_id', $request->current_session_id)
                ->where('class_id', $request->current_class_id)
                ->where('section_id', $request->current_section_id)
                ->where('is_current', true)
                ->get()
                ->map(function ($enrollment) {
                    return [
                        'enrollment_id' => $enrollment->id,
                        'student_id'    => $enrollment->student_id,
                        'admission_no'  => $enrollment->student->admission_no,
                        'name'          => $enrollment->student->first_name . ' ' . $enrollment->student->last_name,
                        'roll_no'       => $enrollment->roll_no,
                        'promote_status'=> 'promote',
                    ];
                });
        }

        return Inertia::render('Admin/Students/Promotions', [
            'sessions' => AcademicSession::orderBy('id', 'desc')->get(),
            'classes'  => SchoolClass::with('sections')->where('is_active', true)->get(),
            'students' => $students,
            'filters'  => $request->only(['current_session_id', 'current_class_id', 'current_section_id'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'next_session_id' => 'required|exists:academic_sessions,id',
            'next_class_id'   => 'required|exists:school_classes,id',
            'next_section_id' => 'required|exists:sections,id',
            'students'        => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->students as $studentData) {
                if ($studentData['promote_status'] === 'leave') {
                    Enrollment::where('id', $studentData['enrollment_id'])->update(['is_current' => false]);
                    continue;
                }

                $classId = $studentData['promote_status'] === 'promote'
                            ? $request->next_class_id
                            : clone $request->current_class_id;

                $sectionId = $studentData['promote_status'] === 'promote'
                            ? $request->next_section_id
                            : clone $request->current_section_id;

                Enrollment::where('id', $studentData['enrollment_id'])->update(['is_current' => false]);

                Enrollment::create([
                    'student_id'          => $studentData['student_id'],
                    'academic_session_id' => $request->next_session_id,
                    'class_id'            => $classId,
                    'section_id'          => $sectionId,
                    'roll_no'             => $studentData['roll_no'],
                    'is_current'          => true,
                ]);
            }

            DB::commit();
            return redirect()->route('admin.students.promotions')->with('success', 'স্টুডেন্টদের সফলভাবে প্রমোশন দেওয়া হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }
}
