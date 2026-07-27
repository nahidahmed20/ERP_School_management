<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OnlineExam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnlineExamController extends Controller
{
    public function index(Request $request)
    {
        $query = OnlineExam::with(['schoolClass', 'subject']);

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->get('class_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $query->latest('exam_date');

        $perPage = $request->get('per_page', 10);
        $exams = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSOnlineExams/Index', [
            'exams' => $exams,
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::where('is_active', true)->select('id', 'name')->get(),
            'subjects' => Subject::where('is_active', true)->select('id', 'name', 'code')->get(),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        OnlineExam::create($data);
        return back()->with('success', 'নতুন অনলাইন এক্সাম তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $exam = OnlineExam::findOrFail($id);
        $data = $this->validateData($request);
        $exam->update($data);
        return back()->with('success', 'এক্সামের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        OnlineExam::findOrFail($id)->delete();
        return back()->with('success', 'এক্সামটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'exam_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'duration_minutes' => 'required|integer|min:1',
            'total_marks' => 'required|numeric|min:0',
            'passing_marks' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'is_active' => 'boolean',
        ]);
    }
}
