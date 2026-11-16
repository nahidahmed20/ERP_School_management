<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Services\StudentLearningService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentLearningController extends Controller
{
    public function download(Request $request, Student $student, string $kind, int $record, StudentLearningService $learning)
    {
        $user = $request->user();
        $guardian = $user->guardian;
        $owns = (int) $student->user_id === (int) $user->id && $user->can('portal.services.view');
        $linked = $guardian && ((int) $student->guardian_id === (int) $guardian->id || $student->guardians()->where('guardians.id', $guardian->id)->exists());
        abort_unless($owns || $linked, 403, 'This learning resource is not available to your account.');
        $item = match ($kind) {
            'homework' => $learning->homework($student)->findOrFail($record),
            'syllabus' => $learning->lessons($student)->findOrFail($record),
            'material' => $learning->materials($student)->findOrFail($record),
            default => abort(404),
        };
        $path = match ($kind) {
            'homework' => $item->document_path,
            'syllabus' => $item->attachment,
            'material' => $item->file_path,
        };
        abort_unless($path, 404);
        // Historical study files used public storage; new uploads use local.
        $disk = Storage::disk('local')->exists($path) ? 'local' : 'public';
        abort_unless(Storage::disk($disk)->exists($path), 404, 'File is not available.');

        return Storage::disk($disk)->download($path, basename($path), [
            'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store, max-age=0',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ]);
    }
}
