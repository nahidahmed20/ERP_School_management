<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LessonPlanController extends Controller
{
    public function index(Request $request)
    {
        $query = LessonPlan::with(['schoolClass', 'subject']);

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $lessons = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/AcademicsLessons/Index', [
            'lessons' => $lessons,
            'classes' => SchoolClass::where('is_active', true)->get(['id', 'name']),
            'subjects' => Subject::where('is_active', true)->get(['id', 'name', 'code']),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        $filePath = null;

        if ($request->hasFile('attachment')) {
            $filePath = $request->file('attachment')->store('syllabus_files', 'public');
        }

        LessonPlan::create(array_merge($request->except('attachment'), [
            'academic_session_id' => $activeSession?->id,
            'attachment' => $filePath
        ]));

        return back()->with('success', 'লেসন/সিলেবাস সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $lesson = LessonPlan::findOrFail($id);
        
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $data = $request->except('attachment');

        if ($request->hasFile('attachment')) {
            if ($lesson->attachment && Storage::disk('public')->exists($lesson->attachment)) {
                Storage::disk('public')->delete($lesson->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('syllabus_files', 'public');
        }

        $lesson->update($data);

        return back()->with('success', 'লেসন/সিলেবাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $lesson = LessonPlan::findOrFail($id);
        
        if ($lesson->attachment && Storage::disk('public')->exists($lesson->attachment)) {
            Storage::disk('public')->delete($lesson->attachment);
        }
        
        $lesson->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}