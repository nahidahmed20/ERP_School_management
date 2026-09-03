<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\PromotionHistory;
use Inertia\Inertia;
use App\Support\CampusRule;

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
            'current_session_id' => ['required', CampusRule::exists('academic_sessions')],
            'current_class_id' => ['required', CampusRule::exists('school_classes')],
            'current_section_id' => ['required', CampusRule::exists('sections')],
            'next_session_id' => ['required', CampusRule::exists('academic_sessions')],
            'next_class_id'   => ['required', CampusRule::exists('school_classes')],
            'next_section_id' => ['required', CampusRule::exists('sections')],
            'students'        => 'required|array',
            'students.*.enrollment_id' => ['required', CampusRule::exists('enrollments')],
            'students.*.student_id' => ['required', CampusRule::exists('students')],
            'students.*.promote_status' => 'required|in:promote,repeat,leave',
            'students.*.roll_no' => 'nullable|string|max:50',
        ]);

        abort_unless(SchoolClass::findOrFail($request->next_class_id)->sections()->whereKey($request->next_section_id)->exists(), 422, 'Next section is not assigned to the selected class.');

        DB::beginTransaction();
        try {
            $batch = (string) Str::uuid();
            foreach ($request->students as $studentData) {
                $enrollment = Enrollment::whereKey($studentData['enrollment_id'])
                    ->where('student_id', $studentData['student_id'])
                    ->where('academic_session_id', $request->current_session_id)
                    ->where('class_id', $request->current_class_id)
                    ->where('section_id', $request->current_section_id)
                    ->where('is_current', true)->lockForUpdate()->firstOrFail();
                if ($studentData['promote_status'] === 'leave') {
                    $enrollment->update(['is_current' => false]);
                    PromotionHistory::create(['batch_uuid'=>$batch,'student_id'=>$studentData['student_id'],'previous_enrollment_id'=>$studentData['enrollment_id'],'action'=>'leave','processed_by'=>$request->user()->id]);
                    continue;
                }

                $classId = $studentData['promote_status'] === 'promote'
                            ? $request->next_class_id
                            : $request->current_class_id;

                $sectionId = $studentData['promote_status'] === 'promote'
                            ? $request->next_section_id
                            : $request->current_section_id;

                $enrollment->update(['is_current' => false]);

                $newEnrollment = Enrollment::create([
                    'student_id'          => $studentData['student_id'],
                    'academic_session_id' => $request->next_session_id,
                    'class_id'            => $classId,
                    'section_id'          => $sectionId,
                    'roll_no'             => $studentData['roll_no'],
                    'is_current'          => true,
                ]);
                PromotionHistory::create(['batch_uuid'=>$batch,'student_id'=>$studentData['student_id'],'previous_enrollment_id'=>$studentData['enrollment_id'],'new_enrollment_id'=>$newEnrollment->id,'action'=>$studentData['promote_status'],'processed_by'=>$request->user()->id]);
            }

            DB::commit();
            return redirect()->route('admin.students.promotions')->with('success', 'স্টুডেন্টদের সফলভাবে প্রমোশন দেওয়া হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function rollback(string $batch)
    {
        DB::transaction(function () use ($batch) {
            $items=PromotionHistory::where('batch_uuid',$batch)->whereNull('rolled_back_at')->lockForUpdate()->get();
            abort_if($items->isEmpty(), 404, 'Promotion batch not found or already rolled back.');
            foreach ($items as $item) {
                if ($item->new_enrollment_id) Enrollment::where('id',$item->new_enrollment_id)->delete();
                if ($item->previous_enrollment_id) Enrollment::where('id',$item->previous_enrollment_id)->update(['is_current'=>true]);
                $item->update(['rolled_back_at'=>now()]);
            }
        });
        return back()->with('success','Promotion batch rolled back.');
    }
}
