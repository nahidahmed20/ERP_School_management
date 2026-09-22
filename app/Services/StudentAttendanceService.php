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
use Illuminate\Validation\ValidationException;

class StudentAttendanceService
{
    public function isLocked(string $date, int $classId, ?int $sectionId = null): bool
    {
        $campusId = config('app.active_campus_id');

        return AttendanceDayLock::where('attendance_type', 'student')
            ->whereDate('attendance_date', $date)
            ->when($campusId, fn($q) => $q->where('campus_id', $campusId)) 
            ->where(fn ($query) => $query->whereNull('class_id')->orWhere('class_id', $classId))
            ->when($sectionId !== null, fn ($query) => $query->where(fn ($part) => $part->whereNull('section_id')->orWhere('section_id', $sectionId)))
            ->exists();
    }

    public function isHoliday(string $date): bool
    {
        $campusId = config('app.active_campus_id');

        $policy = AttendancePolicy::where('is_active', true)
            ->when($campusId, fn($q) => $q->where('campus_id', $campusId)) 
            ->first();

        if (! $policy?->block_holiday_entry) {
            return false;
        }

        return in_array(Carbon::parse($date)->dayOfWeek, $policy->weekly_holidays ?? [])
            || Event::where('is_government_holiday', true)
                ->when($campusId, fn($q) => $q->where('campus_id', $campusId)) 
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
        
        if (!$student->status || !$enrollment) {
            throw ValidationException::withMessages(['error' => 'Student needs an active enrollment.']);
        }
        
        if ($enrollment->campus_id && $student->campus_id) {
            if ((int) $enrollment->campus_id !== (int) $student->campus_id) {
                throw ValidationException::withMessages(['error' => 'Enrollment campus does not match the student.']);
            }
        }

        $session = AcademicSession::whereKey($enrollment->academic_session_id)
            ->where(fn ($query) => $query->whereNull('campus_id')->orWhere('campus_id', $student->campus_id))
            ->first();
            
        if (!$session) {
            throw ValidationException::withMessages(['error' => 'শিক্ষার্থীর কোনো বৈধ একাডেমিক সেশন পাওয়া যায়নি!']);
        }

        $isWithinSession = Carbon::parse($date)->between(
            Carbon::parse($session->start_date), 
            Carbon::parse($session->end_date)
        );
            
        if (!$isWithinSession) {
            throw ValidationException::withMessages(['error' => "হাজিরার তারিখ ($date) শিক্ষার্থীর সেশনের বাইরে! এই সেশনের ({$session->name}) মেয়াদ {$session->start_date} থেকে {$session->end_date} পর্যন্ত।"]);
        }

        return $enrollment;
    }
}