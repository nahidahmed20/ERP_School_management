<?php

namespace App\Services;

use App\Models\{OnlineExam, OnlineExamAnswer, QuizAttempt, Student};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentExamService
{
    public function authorize(Student $student, OnlineExam $exam): void
    {
        abort_unless($student->status && $student->currentEnrollment && $exam->is_active && $exam->is_published
            && (int) $exam->campus_id === (int) $student->campus_id
            && (int) $exam->school_class_id === (int) $student->currentEnrollment->class_id, 403, 'This exam is not available to you.');
    }

    public function deadline(OnlineExam $exam, QuizAttempt $attempt): Carbon
    {
        return $attempt->started_at->copy()->addMinutes($exam->duration_minutes)
            ->min(Carbon::parse($exam->exam_date->toDateString().' '.$exam->end_time));
    }

    public function start(Student $student, OnlineExam $exam): QuizAttempt
    {
        return DB::transaction(function () use ($student, $exam) {
            $exam = OnlineExam::whereKey($exam->id)->lockForUpdate()->firstOrFail();
            $this->authorize($student, $exam);
            $start = Carbon::parse($exam->exam_date->toDateString().' '.$exam->start_time);
            $end = Carbon::parse($exam->exam_date->toDateString().' '.$exam->end_time);
            abort_unless(now()->gte($start) && now()->lt($end), 403, 'Exam is outside its scheduled time.');
            $this->questions($exam);
            $attempt = QuizAttempt::firstOrCreate(['online_exam_id' => $exam->id, 'student_id' => $student->user_id], [
                'campus_id' => $student->campus_id, 'attempt_date' => today(), 'started_at' => now(), 'status' => 'Pending Evaluation',
            ]);
            abort_if($attempt->submitted_at, 422, 'Exam already submitted.');
            abort_unless($attempt->started_at && now()->lt($this->deadline($exam, $attempt)), 422, 'Exam time expired.');

            return $attempt;
        }, 3);
    }

    public function submit(Student $student, OnlineExam $exam, array $answers): void
    {
        DB::transaction(function () use ($student, $exam, $answers) {
            $exam = OnlineExam::whereKey($exam->id)->lockForUpdate()->firstOrFail();
            $this->authorize($student, $exam);
            $attempt = QuizAttempt::where('online_exam_id', $exam->id)->where('student_id', $student->user_id)->lockForUpdate()->firstOrFail();
            abort_if($attempt->submitted_at, 422, 'Exam already submitted.');
            // Two minutes allow an in-flight submission to arrive after the timer expires.
            abort_unless($attempt->started_at && now()->gte($attempt->started_at)
                && now()->lte($this->deadline($exam, $attempt)->addMinutes(2)), 422, 'Exam time expired.');
            $questions = $this->questions($exam);
            if (array_diff(array_map('strval', array_keys($answers)), $questions->pluck('id')->map(fn ($id) => (string) $id)->all())) {
                throw ValidationException::withMessages(['answers' => 'Answers contain a question outside this exam.']);
            }
            $total = 0;
            $needsReview = false;
            foreach ($questions as $question) {
                $answer = $answers[$question->id] ?? null;
                $auto = in_array(strtolower($question->question_type), ['mcq', 'true/false'], true);
                $key = strtolower(trim((string) $question->correct_answer));
                $correct = $auto ? ($key !== '' && $answer !== null && strtolower(trim($answer)) === $key) : null;
                $marks = $correct ? (float) $question->marks : ($auto ? 0 : null);
                $needsReview = $needsReview || ! $auto;
                $total += $marks ?? 0;
                OnlineExamAnswer::create(['quiz_attempt_id' => $attempt->id, 'question_bank_id' => $question->id,
                    'answer' => $answer, 'is_correct' => $correct, 'awarded_marks' => $marks]);
            }
            $attempt->update(['submitted_at' => now(), 'obtained_marks' => $total,
                'status' => $needsReview ? 'Pending Evaluation' : ($total >= (float) $exam->passing_marks ? 'Passed' : 'Failed')]);
        }, 3);
    }

    private function questions(OnlineExam $exam)
    {
        $links = $exam->questions()->with('question')->get();
        abort_if($links->isEmpty(), 422, 'No questions have been assigned to this exam.');
        abort_if($links->contains(fn ($link) => ! $link->question || (int) $link->question->campus_id !== (int) $exam->campus_id), 422, 'An exam question is unavailable. Contact the school.');

        return $links->pluck('question')->unique('id');
    }
}
