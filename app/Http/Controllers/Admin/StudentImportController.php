<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\Campus;
use App\Models\SchoolClass;
use App\Services\MalwareScanner;
use App\Services\StudentCsvImporter;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class StudentImportController extends Controller
{
    public function create()
    {
        $campusId = config('app.active_campus_id');

        return Inertia::render('Admin/Students/Import', [
            'campus' => Campus::find($campusId),
            'sessions' => AcademicSession::where('campus_id', $campusId)->where('is_active', true)->get(['id', 'name', 'is_current']),
            'classes' => SchoolClass::where('campus_id', $campusId)->where('is_active', true)
                ->with(['sections' => fn ($query) => $query->where('is_active', true)])->get(['id', 'name']),
            'maxRows' => StudentCsvImporter::MAX_ROWS,
        ]);
    }

    public function template()
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'wb');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, StudentCsvImporter::HEADERS, ',', '"', '');
            fclose($handle);
        }, 'student-import-template.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request, MalwareScanner $scanner, StudentCsvImporter $importer)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:2048']);
        $campusId = (int) config('app.active_campus_id');
        if (! $campusId) {
            throw ValidationException::withMessages(['campus_id' => 'Select a working campus from the top bar before importing.']);
        }
        $scanner->assertClean($request->file('file'));

        try {
            $count = $importer->import($request->file('file'), $campusId, $request->user());
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            throw ValidationException::withMessages(['file' => 'The import could not be completed. No students were imported. Check for conflicting records and try again.']);
        }

        return redirect()->route('admin.students.index')->with('success', "{$count} students imported into the selected campus. Student portal accounts were not created.");
    }
}
