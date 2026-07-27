<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Course;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        $query = Lesson::with('course');

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->get('course_id'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $lessons = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSLessons/Index', [
            'lessons' => $lessons,
            'campuses' => Campus::select('id', 'name')->get(),
            'courses' => Course::where('is_active', true)->select('id', 'title')->get(),
            'filters' => $request->only(['search', 'course_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('document')) {
            $data['document_path'] = $request->file('document')->store('study_materials', 'public');
        }

        Lesson::create($data);
        return back()->with('success', 'লেসন সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);
        $data = $this->validateData($request);

        if ($request->hasFile('document')) {
            if ($lesson->document_path) {
                Storage::disk('public')->delete($lesson->document_path);
            }
            $data['document_path'] = $request->file('document')->store('study_materials', 'public');
        }

        $lesson->update($data);
        return back()->with('success', 'লেসনের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $lesson = Lesson::findOrFail($id);
        if ($lesson->document_path) {
            Storage::disk('public')->delete($lesson->document_path);
        }
        $lesson->delete();
        return back()->with('success', 'লেসনটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'nullable|url',
            'document' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:10240',
            'is_active' => 'boolean',
        ]);
    }
}
