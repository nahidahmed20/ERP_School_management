<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class HomeworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Homework::with(['schoolClass', 'subject']);

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->get('class_id'));
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $query->latest('homework_date');

        $perPage = $request->get('per_page', 10);
        $homeworks = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSHomework/Index', [
            'homeworks' => $homeworks,
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::where('is_active', true)->select('id', 'name')->get(),
            'subjects' => Subject::where('is_active', true)->select('id', 'name', 'code')->get(),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('document')) {
            $data['document_path'] = $request->file('document')->store('homework_materials', 'public');
        }

        Homework::create($data);
        return back()->with('success', 'নতুন হোমওয়ার্ক সফলভাবে যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $homework = Homework::findOrFail($id);
        $data = $this->validateData($request);

        if ($request->hasFile('document')) {
            if ($homework->document_path) {
                Storage::disk('public')->delete($homework->document_path);
            }
            $data['document_path'] = $request->file('document')->store('homework_materials', 'public');
        }

        $homework->update($data);
        return back()->with('success', 'হোমওয়ার্ক আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $homework = Homework::findOrFail($id);
        if ($homework->document_path) {
            Storage::disk('public')->delete($homework->document_path);
        }
        $homework->delete();
        return back()->with('success', 'হোমওয়ার্ক মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'homework_date' => 'required|date',
            'submission_date' => 'required|date|after_or_equal:homework_date',
            'total_marks' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:5120', // Max 5MB
            'is_active' => 'boolean',
        ]);
    }
}
