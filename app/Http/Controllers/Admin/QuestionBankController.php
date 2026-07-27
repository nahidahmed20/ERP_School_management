<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionBankController extends Controller
{
    public function index(Request $request)
    {
        $query = QuestionBank::with(['schoolClass', 'subject']);

        if ($search = $request->get('search')) {
            $query->where('question', 'like', "%{$search}%");
        }

        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->get('class_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $questions = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSQuestionBank/Index', [
            'questions' => $questions,
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::where('is_active', true)->select('id', 'name')->get(),
            'subjects' => Subject::where('is_active', true)->select('id', 'name', 'code')->get(),
            'filters' => $request->only(['search', 'class_id', 'subject_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        QuestionBank::create($data);
        return back()->with('success', 'প্রশ্নব্যাংকে নতুন প্রশ্ন যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $question = QuestionBank::findOrFail($id);
        $data = $this->validateData($request);
        $question->update($data);
        return back()->with('success', 'প্রশ্ন আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        QuestionBank::findOrFail($id)->delete();
        return back()->with('success', 'প্রশ্নটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'question_type' => 'required|string|max:50',
            'question' => 'required|string',
            'option_a' => 'nullable|string',
            'option_b' => 'nullable|string',
            'option_c' => 'nullable|string',
            'option_d' => 'nullable|string',
            'correct_answer' => 'nullable|in:a,b,c,d',
            'marks' => 'required|numeric|min:0',
            'explanation' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
