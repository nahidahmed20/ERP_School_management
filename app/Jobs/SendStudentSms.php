<?php

namespace App\Jobs;

use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SendStudentSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;
    public int $timeout = 60;
    public array $backoff = [60, 300, 900];

    public function __construct(
        public int $campusId,
        public int $studentId,
        public int $sentBy,
        public ?int $attendanceId = null,
    ) {
        // Persist even when the application's default queue is synchronous.
        $this->onConnection('database');
    }

    public function referenceKey(): string
    {
        return $this->attendanceId ? 'absent:'.$this->attendanceId : 'admission:'.$this->studentId;
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping('student-sms:'.$this->campusId.':'.$this->referenceKey()))
            ->releaseAfter(30)->expireAfter(75)];
    }

    public function tags(): array
    {
        return ['sms', 'campus:'.$this->campusId, 'student:'.$this->studentId];
    }

    public static function hasConsent(Student $student, string $category): bool
    {
        $guardian = $student->guardian;
        if (! $student->campus_id || ! $student->status || ! $guardian
            || (int) $guardian->campus_id !== (int) $student->campus_id
            || ! ($guardian->father_phone ?: $guardian->mother_phone)) return false;

        $preferences = $guardian->notification_preferences ?? [];
        if (! (bool) ($preferences['sms'] ?? true) || ! (bool) ($preferences[$category] ?? true)) return false;

        if (DB::table('student_guardians')->where('student_id', $student->id)
            ->where('guardian_id', $guardian->id)->where('receives_sms', false)->exists()) return false;

        $consent = DB::table('communication_preferences')->where('campus_id', $student->campus_id)
            ->where(['recipient_type' => 'guardian', 'recipient_id' => $guardian->id, 'channel' => 'sms'])
            ->whereIn('category', ['*', $category])->orderByRaw("category = '*' asc")->first();

        return ! $consent || (bool) $consent->is_opted_in;
    }

    public function handle(): void
    {
        if ($this->campusId <= 0) return;

        $previousCampus = config('app.active_campus_id');
        config(['app.active_campus_id' => $this->campusId]);

        try {
            $student = Student::with('guardian')->where('campus_id', $this->campusId)->find($this->studentId);
            $category = $this->attendanceId ? 'attendance' : 'admission';
            if (! $student || ! self::hasConsent($student, $category)) return;

            if ($this->attendanceId) {
                $attendance = StudentAttendance::where('campus_id', $this->campusId)
                    ->where('student_id', $student->id)->where('status', 'absent')->where('is_excused', false)
                    ->find($this->attendanceId);
                if (! $attendance) return;

                $date = $attendance->attendance_date->toDateString();
                if (StudentLeaveRequest::where('student_id', $student->id)->where('school_status', 'Approved')
                    ->whereDate('start_date', '<=', $date)->whereDate('end_date', '>=', $date)->exists()) return;

                $message = "সম্মানিত অভিভাবক, আপনার সন্তান {$student->first_name} {$student->last_name} {$date} তারিখে বিদ্যালয়ে অনুপস্থিত।";
            } else {
                $message = "Welcome to our School! {$student->first_name} has been successfully admitted. Admission No: {$student->admission_no}";
            }

            $guardian = $student->guardian;
            if (! SmsService::send($guardian->father_phone ?: $guardian->mother_phone, $message, [
                'campus_id' => $this->campusId,
                'recipient_name' => $guardian->father_name ?: $guardian->mother_name,
                'recipient_type' => 'guardian', 'recipient_id' => $guardian->id,
                'student_id' => $student->id, 'category' => $category,
                'reference_key' => $this->referenceKey(), 'sent_by' => $this->sentBy,
            ])) {
                throw new RuntimeException('Student SMS delivery failed; the queue will retry.');
            }
        } finally {
            config(['app.active_campus_id' => $previousCampus]);
        }
    }
}
