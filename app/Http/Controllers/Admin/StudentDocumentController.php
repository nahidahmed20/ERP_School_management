<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Support\CampusRule;
use App\Services\MalwareScanner;

class StudentDocumentController extends Controller
{
    public function index(Request $request)
    {
        $student = null;

        if ($request->filled('admission_no')) {
            $student = Student::with([
                'currentEnrollment.schoolClass', 
                'documents'
            ])->where('admission_no', $request->admission_no)->first();

            if (!$student) {
                return back()->with('error', 'এই অ্যাডমিশন নম্বরের কোনো শিক্ষার্থী পাওয়া যায়নি!');
            }
        }

        return Inertia::render('Admin/StudentsDocuments/Index', [
            'student' => $student,
            'filters' => $request->only('admission_no')
        ]);
    }

    public function store(Request $request, MalwareScanner $scanner)
    {
        $request->validate([
            'student_id' => ['required', CampusRule::exists('students')],
            'document_type' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048', 
            'remarks' => 'nullable|string|max:255',
        ], [
            'file.required' => 'দয়া করে একটি ফাইল নির্বাচন করুন!',
            'file.mimes' => 'ফাইলটি অবশ্যই PDF বা ছবি (JPG, PNG) হতে হবে!',
        ]);

        $scanner->assertClean($request->file('file'));
        $path = $request->file('file')->store('student_documents/'.config('app.active_campus_id'), 'local');

        StudentDocument::create([
            'student_id' => $request->student_id,
            'document_type' => $request->document_type,
            'file_path' => $path,
            'remarks' => $request->remarks,
        ]);

        return back()->with('success', 'ডকুমেন্ট সফলভাবে আপলোড করা হয়েছে!');
    }

    public function destroy($id)
    {
        $document = StudentDocument::findOrFail($id);
        
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }
        
        $document->delete();

        return back()->with('success', 'ডকুমেন্ট মুছে ফেলা হয়েছে!');
    }
}
