<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendStudentSms;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use App\Services\StudentAttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentAttendanceController extends Controller
{
    private function existsRule(string $table)
    {
        $campusId = config('app.active_campus_id');
        $rule = Rule::exists($table, 'id');
        return $campusId ? $rule->where('campus_id', $campusId) : $rule;
    }

    public function index(Request $request, StudentAttendanceService $service)
    {
        $campusId = config('app.active_campus_id');

        // 🔒 Data Leak Protection Logic
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $filters = $request->validate([
            'class_id' => ['nullable', $this->existsRule('school_classes')],
            'section_id' => ['nullable', $this->existsRule('sections')],
            'date' => 'nullable|date_format:Y-m-d|before_or_equal:today',
        ]);

        $classId = $filters['class_id'] ?? null;
        $sectionId = $filters['section_id'] ?? null;
        $date = $filters['date'] ?? today()->toDateString();
        $students = collect();

        if ($classId) {
            $this->assertSection($classId, $sectionId);
            $students = Student::with('currentEnrollment')
                ->where('status', true)
                ->where($filter)
                ->whereHas('currentEnrollment', fn ($query) => $query->where('class_id', $classId)
                    ->when($sectionId, fn ($part) => $part->where('section_id', $sectionId)))
                ->orderBy('first_name')->get();

            $attendances = StudentAttendance::whereIn('student_id', $students->modelKeys())
                ->whereDate('attendance_date', $date)->get()->keyBy('student_id');

            $students->each(function ($student) use ($attendances, $service) {
                $attendance = $attendances->get($student->id);
                $student->attendance_status = $attendance?->status;
                $student->remarks = $attendance?->remarks ?? '';
                $student->attendance_source = $attendance?->source;
                $student->attendance_in_time = $attendance?->in_time;
                $student->attendance_out_time = $attendance?->out_time;
                $student->attendance_is_excused = $attendance?->is_excused ?? false;
                $student->attendance_read_only = $attendance && $service->isProtected($attendance);
                $student->has_attendance = (bool) $attendance;
            });
        }

        return Inertia::render('Admin/Attendance/Index', [
            'classes' => SchoolClass::with('sections')->where('is_active', true)->where($filter)->get(),
            'students' => $students,
            'sheetLocked' => $classId && $service->isLocked($date, (int) $classId, $sectionId ? (int) $sectionId : null),
            'isHoliday' => $service->isHoliday($date),
            'filters' => ['class_id' => $classId ?? '', 'section_id' => $sectionId ?? '', 'date' => $date],
        ]);
    }

    public function store(Request $request, StudentAttendanceService $service)
    {
        $data = $request->validate([
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['nullable', $this->existsRule('sections')],
            'date' => 'required|date_format:Y-m-d|before_or_equal:today',
            'attendances' => 'required|array|min:1',
            'attendances.*.student_id' => ['required', 'distinct', $this->existsRule('students')],
            'attendances.*.status' => 'required|in:present,absent,late,half_day',
            'attendances.*.remarks' => 'nullable|string|max:255',
        ]);

        $this->assertSection($data['class_id'], $data['section_id'] ?? null);

        DB::transaction(function () use ($data, $request, $service) {
            SchoolClass::whereKey($data['class_id'])->lockForUpdate()->firstOrFail();
            abort_if($service->isLocked($data['date'], (int) $data['class_id'], ! empty($data['section_id']) ? (int) $data['section_id'] : null), 422, 'This attendance sheet is locked. Reopen it from Attendance Control.');
            abort_if($service->isHoliday($data['date']), 422, 'Attendance cannot be entered on a configured holiday.');

            $students = Student::with('currentEnrollment')->whereIn('id', array_column($data['attendances'], 'student_id'))
                ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            foreach ($data['attendances'] as $item) {
                $student = $students->get($item['student_id']);
                abort_unless($student, 422, 'Selected student is not available.');

                $enrollment = $service->enrollmentForDate($student, $data['date']);
                abort_unless((int) $enrollment->class_id === (int) $data['class_id']
                    && (empty($data['section_id']) || (int) $enrollment->section_id === (int) $data['section_id']), 422, 'A selected student is not enrolled in this class and section.');

                $existing = StudentAttendance::where('student_id', $student->id)->whereDate('attendance_date', $data['date'])->lockForUpdate()->first();
                if ($existing && $service->isProtected($existing)) {
                    abort_if($existing->status !== $item['status'] || (string) $existing->remarks !== (string) ($item['remarks'] ?? ''), 422, 'Verified attendance cannot be overwritten manually. Submit an attendance correction request.');
                    continue;
                }

                abort_if($existing && ((int) $existing->school_class_id !== (int) $enrollment->class_id || (int) $existing->academic_session_id !== (int) $enrollment->academic_session_id), 422, 'An attendance record already belongs to another enrollment. Use the correction workflow.');

                $excused = $item['status'] === 'absent' && StudentLeaveRequest::where('student_id', $student->id)
                    ->where('school_status', 'Approved')->whereDate('start_date', '<=', $data['date'])->whereDate('end_date', '>=', $data['date'])->exists();

                StudentAttendance::updateOrCreate(
                    ['student_id' => $student->id, 'attendance_date' => $data['date']],
                    [
                        'campus_id' => $student->campus_id,
                        'school_class_id' => $enrollment->class_id,
                        'section_id' => $enrollment->section_id,
                        'academic_session_id' => $enrollment->academic_session_id,
                        'status' => $item['status'],
                        'is_excused' => $excused,
                        'remarks' => $item['remarks'] ?? null,
                        'source' => $excused ? 'approved_leave' : 'manual',
                        'recorded_by' => $request->user()->id,
                        'verified_at' => now(),
                    ]
                );
            }
        }, 3);

        return back()->with('success', 'Attendance saved successfully.');
    }

    public function destroy(Request $request, StudentAttendanceService $service)
    {
        $data = $request->validate([
            'class_id' => ['required', $this->existsRule('school_classes')],
            'section_id' => ['nullable', $this->existsRule('sections')],
            'date' => 'required|date_format:Y-m-d|before_or_equal:today',
        ]);

        $this->assertSection($data['class_id'], $data['section_id'] ?? null);

        DB::transaction(function () use ($data, $service) {
            SchoolClass::whereKey($data['class_id'])->lockForUpdate()->firstOrFail();
            abort_if($service->isLocked($data['date'], (int) $data['class_id'], ! empty($data['section_id']) ? (int) $data['section_id'] : null), 422, 'This attendance sheet is locked.');

            $records = StudentAttendance::where('school_class_id', $data['class_id'])->whereDate('attendance_date', $data['date'])
                ->when($data['section_id'] ?? null, fn ($query, $section) => $query->where('section_id', $section))->lockForUpdate()->get();

            abort_if($records->contains(fn ($record) => $service->isProtected($record)), 422, 'Verified attendance cannot be deleted. Use the correction workflow.');
            StudentAttendance::whereIn('id', $records->modelKeys())->delete();
        });

        return back()->with('success', 'Attendance records deleted.');
    }

    public function sendAbsentSms(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date_format:Y-m-d|before_or_equal:today',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => ['required', 'distinct', $this->existsRule('students')],
        ]);

        $campusId = config('app.active_campus_id');
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $records = StudentAttendance::whereDate('attendance_date', $data['date'])
            ->whereIn('student_id', $data['student_ids'])
            ->where('status', 'absent')
            ->where('is_excused', false)
            ->where($filter)
            ->with('student.guardian')->get();

        $queued = 0;
        $failed = 0;

        foreach ($records as $attendance) {
            $student = $attendance->student;
            if (! $student || ! SendStudentSms::hasConsent($student, 'attendance')) continue;

            try {
                Bus::dispatch(new SendStudentSms((int) $student->campus_id, $student->id, $request->user()->id, $attendance->id));
                $queued++;
            } catch (\Throwable $e) {
                report($e);
                $failed++;
            }
        }

        $response = back()->with('success', "Absent SMS queued for {$queued} guardian(s). Approved leave and opted-out guardians are excluded.");
        if ($failed) {
            $response->with('error', "SMS could not be queued for {$failed} guardian(s). Please try again.");
        }
        return $response;
    }

    private function assertSection(int $classId, ?int $sectionId): void
    {
        if ($sectionId) {
            abort_unless(SchoolClass::findOrFail($classId)->sections()->whereKey($sectionId)->exists(), 422, 'Selected section is not assigned to this class.');
        }
    }
}