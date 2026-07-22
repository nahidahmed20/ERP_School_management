<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Staff;
use App\Models\StudentAttendance;
use App\Models\Payment; 
use App\Models\Invoice; 
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $totalStudents = Student::count();
        $totalStaff = Staff::count(); 
        
        $totalAttendanceToday = StudentAttendance::where('attendance_date', $today)->count();
        $presentToday = StudentAttendance::where('attendance_date', $today)->where('status', 'present')->count();
        $attendancePercentage = $totalAttendanceToday > 0 ? round(($presentToday / $totalAttendanceToday) * 100) : 0;

        $todayCollection = Payment::whereDate('created_at', $today)->sum('amount_paid'); 
        
        // $pendingDues = Invoice::whereIn('status', ['unpaid', 'partial'])->sum('due_amount');
        $pendingDues = 0;

        $recentAdmissions = Student::with('currentEnrollment')
            ->latest('id')
            ->take(3)
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->admission_no,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'class' => 'Class ' . ($student->current_enrollment->class_id ?? 'N/A'), 
                    'date' => $student->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                ['title' => 'Total Students', 'value' => number_format($totalStudents), 'trend' => '+4.5%', 'bgColor' => 'bg-blue-500'],
                ['title' => 'Total Staff & Teachers', 'value' => number_format($totalStaff), 'trend' => '+2%', 'bgColor' => 'bg-purple-500'],
                ['title' => 'Today\'s Attendance', 'value' => $attendancePercentage . '%', 'trend' => '0%', 'bgColor' => 'bg-green-500'],
                ['title' => 'Today\'s Collection', 'value' => number_format($todayCollection), 'isCurrency' => true, 'trend' => '+15%', 'bgColor' => 'bg-indigo-500'],
                ['title' => 'Pending Dues', 'value' => number_format($pendingDues), 'isCurrency' => true, 'trend' => '-5%', 'bgColor' => 'bg-red-500'],
            ],
            'recentAdmissions' => $recentAdmissions,
            
            'pendingLeaves' => [], 
            'absentStaff' => [],
            'notices' => [
                ['title' => 'Welcome to New ERP', 'date' => now()->format('d M, Y'), 'type' => 'Event']
            ],
        ]);
    }
}