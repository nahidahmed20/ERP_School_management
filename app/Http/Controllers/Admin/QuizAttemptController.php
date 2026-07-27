<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\OnlineExam;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    public function index(Request $request)
    {
        $query = QuizAttempt::with(['exam', 'student']);

        if ($search = $request->get('search')) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('exam', function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('exam_id')) {
            $query->where('online_exam_id', $request->get('exam_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $query->latest('attempt_date');

        $perPage = $request->get('per_page', 10);
        $attempts = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/LMSQuizAttempts/Index', [
            'attempts' => $attempts,
            'campuses' => Campus::select('id', 'name')->get(),
            'exams' => OnlineExam::where('is_active', true)->select('id', 'title', 'total_marks', 'passing_marks')->get(),
            'students' => User::select('id', 'name', 'email')->get(),
            'filters' => $request->only(['search', 'exam_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        QuizAttempt::create($data);
        return back()->with('success', 'ম্যানুয়ালি পরীক্ষার রেজাল্ট যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $attempt = QuizAttempt::findOrFail($id);
        $data = $this->validateData($request);
        $attempt->update($data);
        return back()->with('success', 'পরীক্ষার রেজাল্ট আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        QuizAttempt::findOrFail($id)->delete();
        return back()->with('success', 'রেজাল্ট মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'online_exam_id' => 'required|exists:online_exams,id',
            'student_id' => 'required|exists:users,id',
            'attempt_date' => 'required|date',
            'obtained_marks' => 'required|numeric|min:0',
            'status' => 'required|in:Passed,Failed,Pending Evaluation',
            'admin_remarks' => 'nullable|string',
        ]);
    }
}
