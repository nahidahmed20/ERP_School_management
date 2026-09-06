<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Applicant, Homework, HomeworkSubmission, LessonPlan, StaffLeave, StudentDocument, StudentLeaveRequest};
use Illuminate\Support\Facades\Storage;

class SecureFileController extends Controller
{
    public function studentDocument(StudentDocument $document) { return $this->ownedDownload($document, $document->file_path); }
    public function applicantResume(Applicant $applicant) { return $this->ownedDownload($applicant, $applicant->resume); }
    public function homework(Homework $homework) { return $this->ownedDownload($homework, $homework->document_path); }
    public function homeworkSubmission(HomeworkSubmission $submission) { return $this->ownedDownload($submission, $submission->attachment_path); }
    public function lessonPlan(LessonPlan $lessonPlan) { return $this->ownedDownload($lessonPlan, $lessonPlan->attachment); }
    public function staffLeave(StaffLeave $leave) { return $this->ownedDownload($leave, $leave->attachment); }
    public function studentLeave(StudentLeaveRequest $leave) { return $this->ownedDownload($leave, $leave->attachment_path); }

    private function ownedDownload($record, ?string $path)
    {
        abort_unless(config('app.active_campus_id') && (int)$record->campus_id === (int)config('app.active_campus_id'), 404);
        return $this->download($path);
    }

    private function download(?string $path)
    {
        abort_unless($path && Storage::disk('local')->exists($path), 404);
        return Storage::disk('local')->download($path, basename($path), [
            'X-Content-Type-Options'=>'nosniff', 'Cache-Control'=>'private, no-store, max-age=0',
            'Content-Security-Policy'=>"default-src 'none'; sandbox",
        ]);
    }
}
