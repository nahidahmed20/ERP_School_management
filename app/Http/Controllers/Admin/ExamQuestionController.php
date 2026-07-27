<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use App\Models\OnlineExam;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamQuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = ExamQuestion::with(['exam', 'question']);

        if ($examId = $request->get('exam_id')) {
            $query->where('online_exam_id', $examId);
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $examQuestions = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSExamQuestions/Index', [
            'examQuestions' => $examQuestions,
            'exams' => OnlineExam::where('is_active', true)->select('id', 'title', 'school_class_id', 'subject_id', 'total_marks')->get(),
            'questions' => QuestionBank::where('is_active', true)->select('id', 'question', 'marks', 'school_class_id', 'subject_id', 'question_type')->get(),
            'filters' => $request->only(['exam_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'online_exam_id' => 'required|exists:online_exams,id',
            'question_bank_id' => 'required|exists:question_banks,id',
        ]);

        $exists = ExamQuestion::where('online_exam_id', $request->online_exam_id)
                              ->where('question_bank_id', $request->question_bank_id)
                              ->exists();
        if ($exists) {
            return back()->with('error', 'এই প্রশ্নটি ইতিমধ্যে এই এক্সামে যুক্ত আছে!');
        }

        ExamQuestion::create($request->only('online_exam_id', 'question_bank_id'));
        return back()->with('success', 'এক্সামে প্রশ্নটি সফলভাবে যুক্ত করা হয়েছে।');
    }

    public function destroy($id)
    {
        ExamQuestion::findOrFail($id)->delete();
        return back()->with('success', 'এক্সাম থেকে প্রশ্নটি রিমুভ করা হয়েছে।');
    }
}
