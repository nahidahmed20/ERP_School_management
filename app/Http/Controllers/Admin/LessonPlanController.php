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
use App\Support\CampusRule;
use App\Services\MalwareScanner;

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

        $lessons = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();

        return Inertia::render('Admin/AcademicsLessons/Index', [
            'lessons' => $lessons,
            'classes' => SchoolClass::where('is_active', true)->get(['id', 'name']),
            'subjects' => Subject::where('is_active', true)->get(['id', 'name', 'code']),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page'])
        ]);
    }

    public function store(Request $request, MalwareScanner $scanner)
    {
        $request->validate([
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'subject_id' => ['required', CampusRule::exists('subjects')],
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        $filePath = null;

        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            $filePath = $request->file('attachment')->store('syllabus_files/'.config('app.active_campus_id'), 'local');
        }

        LessonPlan::create(array_merge($request->except('attachment'), [
            'academic_session_id' => $activeSession?->id,
            'attachment' => $filePath
        ]));

        return back()->with('success', 'লেসন/সিলেবাস সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id, MalwareScanner $scanner)
    {
        $lesson = LessonPlan::findOrFail($id);
        
        $request->validate([
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'subject_id' => ['required', CampusRule::exists('subjects')],
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $data = $request->except('attachment');

        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            if ($lesson->attachment && Storage::disk('local')->exists($lesson->attachment)) {
                Storage::disk('local')->delete($lesson->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('syllabus_files/'.config('app.active_campus_id'), 'local');
        }

        $lesson->update($data);

        return back()->with('success', 'লেসন/সিলেবাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $lesson = LessonPlan::findOrFail($id);
        
        if ($lesson->attachment && Storage::disk('local')->exists($lesson->attachment)) {
            Storage::disk('local')->delete($lesson->attachment);
        }
        
        $lesson->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
