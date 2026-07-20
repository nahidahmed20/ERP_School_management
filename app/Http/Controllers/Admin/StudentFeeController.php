<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FeeGroup;
use App\Models\FeeAssignment;
use App\Models\SchoolClass;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StudentFeeController extends Controller
{
    public function index(Request $request)
    {
        $students = [];

        if ($request->filled(['class_id', 'section_id'])) {
            $students = Student::with([
                'currentEnrollment.schoolClass',
                'currentEnrollment.section',
                'feeAssignments.feeGroup'
            ])
            ->whereHas('currentEnrollment', function($q) use ($request) {
                $q->where('class_id', $request->class_id);
                if ($request->filled('section_id')) {
                    $q->where('section_id', $request->section_id);
                }
            })->get();
        }

        return Inertia::render('Admin/FeesStudentFees/Index', [
            'students'  => $students,
            'classes'   => SchoolClass::with('sections')->where('is_active', true)->get(),
            'feeGroups' => FeeGroup::where('is_active', true)->get(),
            'filters'   => $request->only(['class_id', 'section_id'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_ids'  => 'required|array|min:1',
            'fee_group_id' => 'required|exists:fee_groups,id',
            'due_date'     => 'required|date'
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        if (!$activeSession) {
            return back()->with('error', 'কোনো অ্যাক্টিভ শিক্ষাবর্ষ পাওয়া যায়নি!');
        }

        DB::beginTransaction();
        try {
            foreach ($request->student_ids as $studentId) {
                FeeAssignment::updateOrCreate(
                    [
                        'student_id'          => $studentId,
                        'fee_group_id'        => $request->fee_group_id,
                        'academic_session_id' => $activeSession->id
                    ],
                    [
                        'due_date' => $request->due_date,
                        'status'   => 'unpaid'
                    ]
                );
            }
            DB::commit();
            return back()->with('success', 'নির্বাচিত শিক্ষার্থীদের ফি সফলভাবে অ্যাসাইন করা হয়েছে!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $assignment = FeeAssignment::findOrFail($id);

        if ($assignment->status !== 'unpaid') {
            return back()->with('error', 'এই ফি ইতোমধ্যে পরিশোধিত, তাই বাতিল করা সম্ভব নয়!');
        }

        $assignment->delete();
        return back()->with('success', 'ফি অ্যাসাইনমেন্ট বাতিল করা হয়েছে!');
    }
}
