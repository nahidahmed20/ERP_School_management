<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['schoolClass', 'subject', 'teacher']);

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->get('class_id'));
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $courses = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSCourses/Index', [
            'courses' => $courses,
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::where('is_active', true)->select('id', 'name')->get(),
            'subjects' => Subject::where('is_active', true)->select('id', 'name', 'code')->get(),
            'teachers' => User::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Course::create($data);
        return back()->with('success', 'নতুন কোর্স সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $data = $this->validateData($request);
        $course->update($data);
        return back()->with('success', 'কোর্সের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        Course::findOrFail($id)->delete();
        return back()->with('success', 'কোর্সটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'is_active' => 'boolean',
        ]);
    }
}
