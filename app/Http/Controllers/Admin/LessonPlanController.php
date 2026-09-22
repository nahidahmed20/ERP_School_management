<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\MalwareScanner;

class LessonPlanController extends Controller
{
    private function existsRule(string $table)
    {
        $campusId = config('app.active_campus_id');
        $rule = Rule::exists($table, 'id');
        return $campusId ? $rule->where('campus_id', $campusId) : $rule;
    }

    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        
        $query = LessonPlan::with(['schoolClass', 'subject']);
        $classesQuery = SchoolClass::where('is_active', true);
        $subjectsQuery = Subject::where('is_active', true);

        // 🔒 Data Leak Protection & Super Admin Bypass
        if ($campusId) {
            $query->where('campus_id', $campusId);
            $classesQuery->where('campus_id', $campusId);
            $subjectsQuery->where('campus_id', $campusId);
        }

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
            'classes' => $classesQuery->get(['id', 'name']),
            'subjects' => $subjectsQuery->get(['id', 'name', 'code']),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page'])
        ]);
    }

    public function store(Request $request, MalwareScanner $scanner)
    {
        $request->validate([
            'class_id' => ['required', $this->existsRule('school_classes')],
            'subject_id' => ['required', $this->existsRule('subjects')],
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        
        $class = SchoolClass::findOrFail($request->class_id);
        $campusId = $class->campus_id; 

        $filePath = null;
        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            $filePath = $request->file('attachment')->store('syllabus_files/' . $campusId, 'local');
        }

        LessonPlan::create(array_merge($request->except('attachment'), [
            'campus_id' => $campusId, 
            'academic_session_id' => $activeSession?->id,
            'attachment' => $filePath
        ]));

        return back()->with('success', 'লেসন/সিলেবাস সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id, MalwareScanner $scanner)
    {
        $lesson = LessonPlan::findOrFail($id);
        
        $request->validate([
            'class_id' => ['required', $this->existsRule('school_classes')],
            'subject_id' => ['required', $this->existsRule('subjects')],
            'title' => 'required|string|max:255',
            'status' => 'required|in:Pending,Ongoing,Completed',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $data = $request->except('attachment');
        
        $class = SchoolClass::findOrFail($request->class_id);
        $data['campus_id'] = $class->campus_id;

        if ($request->hasFile('attachment')) {
            $scanner->assertClean($request->file('attachment'));
            if ($lesson->attachment && Storage::disk('local')->exists($lesson->attachment)) {
                Storage::disk('local')->delete($lesson->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('syllabus_files/' . $class->campus_id, 'local');
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