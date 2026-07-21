<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\FeeAssignment;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function staffAttendanceReport()
    {
        $staffs = Staff::select('id', 'first_name', 'last_name', 'staff_id_no')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Admin/Reports/staffAttendanceReport', [
            'staffs' => $staffs,
            'reportData' => null,
            'reportType' => null,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:single,all',
            'staff_id' => 'required_if:report_type,single',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        $query = StaffAttendance::with('staff:id,first_name,last_name,staff_id_no')
                    ->whereBetween('date', [$request->from_date, $request->to_date])
                    ->orderBy('date', 'asc');

        if ($request->report_type === 'single') {
            $query->where('staff_id', $request->staff_id);
            $reportData = $query->get();
        } else {
            $reportData = $query->get()->groupBy('staff_id');
        }

        return Inertia::render('Admin/Reports/staffAttendanceReport', [
            'staffs' => Staff::select('id', 'first_name', 'last_name', 'staff_id_no')->where('is_active', true)->get(),
            'reportData' => $reportData,
            'reportType' => $request->report_type,
            'filters' => $request->only(['report_type', 'staff_id', 'from_date', 'to_date'])
        ]);
    }

    public function feeCollection(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? Carbon::now()->endOfMonth()->toDateString();
        $classId = $request->class_id ?? '';

        $query = Payment::with([
            'student.currentEnrollment.schoolClass', 
            'feeAssignment.feeGroup'
        ])->whereBetween('payment_date', [$startDate, $endDate]);

        if ($classId) {
            $query->whereHas('student.currentEnrollment', function($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        $payments = $query->latest()->get();
        
        $totalCollection = $payments->sum('amount_paid');

        return Inertia::render('Admin/Reports/FeeCollection', [
            'payments' => $payments,
            'totalCollection' => $totalCollection,
            'classes' => SchoolClass::where('is_active', true)->get(),
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'class_id' => $classId
            ]
        ]);
    }

    public function dueFees(Request $request)
    {
        $classId = $request->class_id ?? '';
        $sectionId = $request->section_id ?? '';
        $dateUntil = $request->date_until ?? now()->toDateString(); 

        $query = FeeAssignment::with([
            'student.currentEnrollment.schoolClass',
            'student.currentEnrollment.section',
            'student.guardian',
            'feeGroup.feeTypes',
            'payments' 
        ])
        ->whereIn('status', ['unpaid', 'partially_paid'])
        ->whereDate('due_date', '<=', $dateUntil);

        if ($classId) {
            $query->whereHas('student.currentEnrollment', function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) {
                    $q->where('section_id', $sectionId);
                }
            });
        }

        $dueAssignments = $query->get()->map(function ($assignment) {
            $totalFee = $assignment->feeGroup->feeTypes->sum('amount');
            $paidFee = $assignment->payments->sum('amount_paid');
            $dueAmount = $totalFee - $paidFee;

            $assignment->total_fee = $totalFee;
            $assignment->paid_fee = $paidFee;
            $assignment->due_amount = $dueAmount;

            return $assignment;
        })->filter(function ($assignment) {
            return $assignment->due_amount > 0; 
        });

        return Inertia::render('Admin/Reports/DueFees', [
            'dueAssignments' => $dueAssignments->values(),
            'totalDue' => $dueAssignments->sum('due_amount'),
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'filters' => [
                'class_id' => $classId,
                'section_id' => $sectionId,
                'date_until' => $dateUntil,
            ]
        ]);
    }

    public function studentReport(Request $request)
    {
        $classId = $request->class_id;
        $sectionId = $request->section_id;
        
        $month = $request->month ?? date('m');
        $year = $request->year ?? date('Y');

        $reportData = [];

        if ($classId) {
            $students = Student::with(['currentEnrollment.school_class', 'currentEnrollment.section'])
                ->whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                    $q->where('class_id', $classId);
                    if ($sectionId) {
                        $q->where('section_id', $sectionId);
                    }
                })->get();

            foreach ($students as $student) {
                $attendances = StudentAttendance::where('student_id', $student->id)
                    ->whereMonth('attendance_date', $month)
                    ->whereYear('attendance_date', $year)
                    ->get();

                $reportData[] = [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'admission_no' => $student->admission_no,
                    'roll_no' => $student->currentEnrollment->roll_no,
                    'class_name' => $student->currentEnrollment->school_class->name,
                    'total_present' => $attendances->where('status', 'present')->count(),
                    'total_absent' => $attendances->where('status', 'absent')->count(),
                    'total_late' => $attendances->where('status', 'late')->count(),
                    'total_half_day' => $attendances->where('status', 'half_day')->count(),
                    'total_working_days' => $attendances->count(),
                ];
            }
        }

        return Inertia::render('Admin/Reports/StudentAttendance', [
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'reportData' => $reportData,
            'filters' => [
                'class_id' => $classId ?? '',
                'section_id' => $sectionId ?? '',
                'month' => $month,
                'year' => $year,
            ]
        ]);
    }

}
