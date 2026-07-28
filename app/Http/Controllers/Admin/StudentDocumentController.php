<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'document_type' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048', 
            'remarks' => 'nullable|string|max:255',
        ], [
            'file.required' => 'দয়া করে একটি ফাইল নির্বাচন করুন!',
            'file.mimes' => 'ফাইলটি অবশ্যই PDF বা ছবি (JPG, PNG) হতে হবে!',
        ]);

        $path = $request->file('file')->store('student_documents', 'public');

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
        
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();

        return back()->with('success', 'ডকুমেন্ট মুছে ফেলা হয়েছে!');
    }
}