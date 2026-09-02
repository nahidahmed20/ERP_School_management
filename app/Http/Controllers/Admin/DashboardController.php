<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExamSchedule;
use App\Models\ExamMark;
use App\Models\Homework;
use App\Models\Invoice;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Staff;
use App\Models\StaffLeave;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudyMaterial;
use App\Models\TimeTable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function results(Request $request): Response
    {
        $student = $request->user()->student;
        abort_unless($student, 403, 'Only linked student accounts can view this page.');

        $results = ExamMark::query()
            ->with(['exam:id,name,start_date,end_date,results_published', 'subject:id,name'])
            ->where('student_id', $student->id)
            ->whereHas('exam', fn ($query) => $query->where('results_published', true))
            ->orderByDesc('exam_id')->get()->groupBy('exam_id')->map(function ($marks) {
                $count = $marks->whereNotNull('marks_obtained')->count();
                $failed = $marks->contains(fn ($mark) => $mark->grade === 'F');
                return [
                    'exam' => $marks->first()->exam?->name,
                    'date' => $marks->first()->exam?->end_date?->format('d M Y'),
                    'marks' => $marks->map(fn ($mark) => [
                        'subject' => $mark->subject?->name,
                        'marks' => $mark->marks_obtained,
                        'grade' => $mark->grade,
                        'grade_point' => $mark->grade_point,
                        'note' => $mark->note,
                        'written' => $mark->written_marks,
                        'practical' => $mark->practical_marks,
                        'viva' => $mark->viva_marks,
                        'full_marks' => $mark->full_marks,
                        'pass_marks' => $mark->pass_marks,
                    ])->values(),
                    'total' => (float) $marks->sum('marks_obtained'),
                    'gpa' => $count ? round((float) $marks->sum('grade_point') / $count, 2) : null,
                    'status' => $failed ? 'Failed' : 'Passed',
                ];
            })->values();

        return Inertia::render('Portal/Results', [
            'student' => ['name' => trim($student->first_name.' '.$student->last_name), 'admission_no' => $student->admission_no],
            'results' => $results,
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'roles',
            'student.currentEnrollment.schoolClass',
            'student.currentEnrollment.section',
            'guardian.students.currentEnrollment.schoolClass',
            'guardian.students.currentEnrollment.section',
            'staff.department',
            'staff.designation',
        ]);

        if ($user->student) {
            return Inertia::render('Portal/Dashboard', [
                'portal' => $this->studentPortal($user->student, 'student'),
            ]);
        }

        if ($user->guardian) {
            $children = $user->guardian->students;
            $student = $children->firstWhere('id', $request->integer('student_id')) ?? $children->first();

            return Inertia::render('Portal/Dashboard', [
                'portal' => $student
                    ? $this->studentPortal($student, 'parent', $children)
                    : $this->emptyParentPortal(),
            ]);
        }

        if ($user->staff) {
            return Inertia::render('Portal/Dashboard', [
                'portal' => $this->staffPortal($user->staff),
            ]);
        }

        $today = Carbon::today();

        $totalAttendanceToday = StudentAttendance::where('attendance_date', $today)->count();
        $presentToday = StudentAttendance::where('attendance_date', $today)->where('status', 'present')->count();
        $attendancePercentage = $totalAttendanceToday > 0 ? round(($presentToday / $totalAttendanceToday) * 100) : 0;

        $todayCollection = Payment::whereDate('payment_date', $today)->sum('amount_paid');
        $todayExpense = Expense::whereDate('expense_date', $today)->sum('amount');
        $monthStart = $today->copy()->startOfMonth();
        $monthCollection = Payment::whereBetween('payment_date', [$monthStart, $today])->sum('amount_paid');
        $monthExpense = Expense::whereBetween('expense_date', [$monthStart, $today])->sum('amount');
        $pendingInvoices = Invoice::whereIn('status', ['Unpaid', 'Partial']);
        $pendingDues = (clone $pendingInvoices)->sum(DB::raw('amount + fine - discount - paid_amount'));

        $recentAdmissions = Student::with('currentEnrollment.schoolClass')
            ->latest('id')
            ->take(3)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->admission_no,
                    'name' => trim($student->first_name.' '.$student->last_name),
                    'class' => $student->currentEnrollment?->schoolClass?->name ?? 'N/A',
                    'date' => $student->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                ['title' => 'Total Students', 'value' => Student::count()],
                ['title' => 'Total Staff & Teachers', 'value' => Staff::count()],
                ['title' => 'Today\'s Attendance', 'value' => $attendancePercentage.'%'],
                ['title' => 'Today\'s Collection', 'value' => (float) $todayCollection, 'isCurrency' => true],
                ['title' => 'Pending Dues', 'value' => (float) $pendingDues, 'isCurrency' => true],
            ],
            'recentAdmissions' => $recentAdmissions,
            'financialStats' => [
                ['title' => 'Unpaid Invoices', 'value' => (clone $pendingInvoices)->count(), 'routeName' => 'admin.studentfees.index'],
                ['title' => 'Unpaid Amount', 'value' => (float) $pendingDues, 'currency' => true, 'routeName' => 'admin.studentfees.index'],
                ['title' => 'Income Today', 'value' => (float) $todayCollection, 'currency' => true, 'routeName' => 'admin.fees.ledger'],
                ['title' => 'Expense Today', 'value' => (float) $todayExpense, 'currency' => true, 'routeName' => 'admin.fees.ledger'],
                ['title' => 'Profit Today', 'value' => (float) ($todayCollection - $todayExpense), 'currency' => true, 'routeName' => 'admin.reports.saved'],
                ['title' => 'This Month Profit', 'value' => (float) ($monthCollection - $monthExpense), 'currency' => true, 'routeName' => 'admin.fees.ledger'],
            ],
            'pendingLeaves' => StaffLeave::with('staff:id,first_name,last_name')->where('status', 'pending')->latest()->take(5)->get(),
            'notices' => Notice::where('is_active', true)->latest('notice_date')->take(5)->get(['id', 'title', 'notice_date', 'type']),
        ]);
    }

    private function studentPortal(Student $student, string $type, $children = null): array
    {
        $student->loadMissing(['currentEnrollment.schoolClass', 'currentEnrollment.section']);
        $enrollment = $student->currentEnrollment;
        $today = Carbon::today();
        $classId = $enrollment?->class_id;
        $sectionId = $enrollment?->section_id;

        $classes = $classId && $sectionId
            ? TimeTable::with(['subject:id,name', 'teacher:id,first_name,last_name', 'classroom:id,room_number'])
                ->where('class_id', $classId)
                ->where('section_id', $sectionId)
                ->whereRaw('LOWER(day_of_week) = ?', [strtolower($today->englishDayOfWeek)])
                ->orderBy('start_time')
                ->get()
                ->map(fn (TimeTable $item) => [
                    'id' => $item->id,
                    'subject' => $item->subject?->name ?? 'Class',
                    'teacher' => trim(($item->teacher?->first_name ?? '').' '.($item->teacher?->last_name ?? '')) ?: 'Not assigned',
                    'room' => $item->classroom?->room_number ?? 'TBA',
                    'start' => Carbon::parse($item->start_time)->format('h:i A'),
                    'end' => Carbon::parse($item->end_time)->format('h:i A'),
                ])->values()
            : collect();

        $exams = $classId && $sectionId
            ? ExamSchedule::with(['exam:id,name', 'subject:id,name', 'classroom:id,room_number'])
                ->where('class_id', $classId)
                ->where('section_id', $sectionId)
                ->whereBetween('exam_date', [$today, $today->copy()->addDays(14)])
                ->orderBy('exam_date')
                ->orderBy('start_time')
                ->get()
                ->map(fn (ExamSchedule $item) => [
                    'id' => $item->id,
                    'exam' => $item->exam?->name ?? 'Examination',
                    'subject' => $item->subject?->name ?? 'Subject',
                    'date' => Carbon::parse($item->exam_date)->format('d M Y'),
                    'is_today' => Carbon::parse($item->exam_date)->isToday(),
                    'time' => Carbon::parse($item->start_time)->format('h:i A').' – '.Carbon::parse($item->end_time)->format('h:i A'),
                    'room' => $item->classroom?->room_number ?? 'TBA',
                ])->values()
            : collect();

        $homework = $classId
            ? Homework::with('subject:id,name')
                ->where('school_class_id', $classId)
                ->where('is_active', true)
                ->whereDate('submission_date', '>=', $today)
                ->orderBy('submission_date')
                ->take(8)
                ->get()
                ->map(fn (Homework $item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'subject' => $item->subject?->name ?? 'General',
                    'description' => $item->description,
                    'due' => Carbon::parse($item->submission_date)->format('d M Y'),
                    'due_relative' => Carbon::parse($item->submission_date)->diffForHumans(),
                    'document_url' => $item->document_path ? asset('storage/'.$item->document_path) : null,
                ])->values()
            : collect();

        $materials = $classId
            ? StudyMaterial::with('subject:id,name')
                ->where('class_id', $classId)
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (StudyMaterial $item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'subject' => $item->subject?->name ?? 'General',
                    'file_type' => strtoupper($item->file_type ?: pathinfo($item->file_path, PATHINFO_EXTENSION)),
                    'file_url' => asset('storage/'.$item->file_path),
                ])->values()
            : collect();

        $attendanceQuery = StudentAttendance::where('student_id', $student->id);
        $attendanceTotal = (clone $attendanceQuery)->count();
        $attendancePresent = (clone $attendanceQuery)->where('status', 'present')->count();
        $dues = Invoice::where('student_id', $student->id)
            ->whereIn('status', ['Unpaid', 'Partial'])
            ->get()
            ->sum(fn (Invoice $invoice) => max(0, (float) $invoice->amount + (float) $invoice->fine - (float) $invoice->discount - (float) $invoice->paid_amount));

        return [
            'type' => $type,
            'today' => $today->format('l, d F Y'),
            'greeting_name' => trim($student->first_name.' '.$student->last_name),
            'student' => [
                'id' => $student->id,
                'name' => trim($student->first_name.' '.$student->last_name),
                'admission_no' => $student->admission_no,
                'class' => $enrollment?->schoolClass?->name ?? 'Not assigned',
                'section' => $enrollment?->section?->name ?? 'Not assigned',
            ],
            'children' => collect($children)->map(fn (Student $child) => [
                'id' => $child->id,
                'name' => trim($child->first_name.' '.$child->last_name),
                'class' => $child->currentEnrollment?->schoolClass?->name ?? 'Not assigned',
            ])->values(),
            'classes' => $classes,
            'exams' => $exams,
            'homework' => $homework,
            'materials' => $materials,
            'attendance' => [
                'percentage' => $attendanceTotal ? round(($attendancePresent / $attendanceTotal) * 100) : 0,
                'today' => StudentAttendance::where('student_id', $student->id)->whereDate('attendance_date', $today)->value('status'),
                'recent' => StudentAttendance::where('student_id', $student->id)->latest('attendance_date')->take(7)->get()
                    ->map(fn ($row) => ['date' => Carbon::parse($row->attendance_date)->format('d M'), 'status' => $row->is_excused ? 'leave' : $row->status])->values(),
            ],
            'can_view_results' => $type === 'student' && request()->user()->can('portal.results.view'),
            'dues' => round($dues, 2),
            'notices' => $this->portalNotices(),
        ];
    }

    private function staffPortal(Staff $staff): array
    {
        $today = Carbon::today();
        $classes = TimeTable::with(['schoolClass:id,name', 'section:id,name', 'subject:id,name', 'classroom:id,room_number'])
            ->where('teacher_id', $staff->id)
            ->whereRaw('LOWER(day_of_week) = ?', [strtolower($today->englishDayOfWeek)])
            ->orderBy('start_time')
            ->get()
            ->map(fn (TimeTable $item) => [
                'id' => $item->id,
                'subject' => $item->subject?->name ?? 'Class',
                'class' => trim(($item->schoolClass?->name ?? '').' '.($item->section?->name ?? '')) ?: 'Not assigned',
                'room' => $item->classroom?->room_number ?? 'TBA',
                'start' => Carbon::parse($item->start_time)->format('h:i A'),
                'end' => Carbon::parse($item->end_time)->format('h:i A'),
            ])->values();

        return [
            'type' => 'staff',
            'today' => $today->format('l, d F Y'),
            'greeting_name' => trim($staff->first_name.' '.$staff->last_name),
            'staff' => [
                'staff_no' => $staff->staff_id_no,
                'department' => $staff->department?->name ?? 'Not assigned',
                'designation' => $staff->designation?->name ?? 'Staff',
            ],
            'classes' => $classes,
            'attendance' => StaffAttendance::where('staff_id', $staff->id)->whereDate('date', $today)->value('status'),
            'attendance_recent' => StaffAttendance::where('staff_id', $staff->id)->latest('date')->take(7)->get()
                ->map(fn ($row) => ['date' => Carbon::parse($row->date)->format('d M'), 'status' => $row->status])->values(),
            'tasks' => $classes->map(fn ($class) => [
                'id' => 'class-'.$class['id'], 'title' => 'Teach '.$class['subject'],
                'detail' => $class['class'].' · '.$class['start'].'-'.$class['end'].' · Room '.$class['room'],
            ])->values(),
            'leaves' => StaffLeave::with('leaveType:id,name')->where('staff_id', $staff->id)->latest()->take(5)->get()->map(fn (StaffLeave $leave) => [
                'id' => $leave->id,
                'type' => $leave->leaveType?->name ?? 'Leave',
                'from' => Carbon::parse($leave->start_date)->format('d M'),
                'to' => Carbon::parse($leave->end_date)->format('d M Y'),
                'status' => $leave->status,
            ]),
            'notices' => $this->portalNotices(),
        ];
    }

    private function portalNotices()
    {
        return Notice::where('is_active', true)->latest('notice_date')->take(6)->get()->map(fn (Notice $notice) => [
            'id' => $notice->id,
            'title' => $notice->title,
            'type' => $notice->type,
            'date' => $notice->notice_date?->format('d M Y'),
        ]);
    }

    private function emptyParentPortal(): array
    {
        return [
            'type' => 'parent',
            'today' => now()->format('l, d F Y'),
            'greeting_name' => request()->user()->name,
            'student' => null,
            'children' => [],
            'classes' => [],
            'exams' => [],
            'homework' => [],
            'materials' => [],
            'attendance' => ['percentage' => 0, 'today' => null],
            'can_view_results' => false,
            'dues' => 0,
            'notices' => $this->portalNotices(),
        ];
    }
}
