<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\AttendanceDayLock;
use App\Models\AttendancePolicy;
use App\Models\Enrollment;
use App\Models\Event;
use App\Models\Student;
use App\Models\StudentAttendance;
use Carbon\Carbon;

class StudentAttendanceService
{
    public function isLocked(string $date, int $classId, ?int $sectionId = null): bool
    {
        return AttendanceDayLock::where('attendance_type', 'student')
            ->whereDate('attendance_date', $date)
            ->where(fn ($query) => $query->whereNull('class_id')->orWhere('class_id', $classId))
            // An all-sections operation must respect every section's lock.
            ->when($sectionId !== null, fn ($query) => $query->where(fn ($part) => $part->whereNull('section_id')->orWhere('section_id', $sectionId)))
            ->exists();
    }

    public function isHoliday(string $date): bool
    {
        $policy = AttendancePolicy::where('is_active', true)->first();
        if (! $policy?->block_holiday_entry) {
            return false;
        }

        return in_array(Carbon::parse($date)->dayOfWeek, $policy->weekly_holidays ?? [])
            || Event::where('is_government_holiday', true)
                ->whereDate('start_datetime', '<=', $date)
                ->whereDate('end_datetime', '>=', $date)->exists();
    }

    public function isProtected(StudentAttendance $attendance): bool
    {
        return str_contains((string) $attendance->source, 'zkteco')
            || in_array($attendance->source, ['approved_correction', 'approved_leave'], true)
            || $attendance->is_excused;
    }

    public function enrollmentForDate(Student $student, string $date): Enrollment
    {
        $enrollment = $student->currentEnrollment;
        abort_unless($student->status && $enrollment, 422, 'Student needs an active enrollment.');
        abort_unless((int) $enrollment->campus_id === (int) $student->campus_id, 422, 'Enrollment campus does not match the student.');

        $session = AcademicSession::whereKey($enrollment->academic_session_id)
            ->where(fn ($query) => $query->whereNull('campus_id')->orWhere('campus_id', $student->campus_id))
            ->whereDate('start_date', '<=', $date)->whereDate('end_date', '>=', $date)->first();
        abort_unless($session, 422, 'Attendance date is outside the student enrollment session.');

        return $enrollment;
    }
}
