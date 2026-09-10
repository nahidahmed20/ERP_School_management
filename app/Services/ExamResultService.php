<?php

namespace App\Services;

use App\Models\Grade;
use Illuminate\Support\Collection;

class ExamResultService
{
    public function summary(Collection $marks, int $expectedSubjects = 0): array
    {
        $incomplete = $marks->isEmpty() || $marks->count() < $expectedSubjects
            || $marks->contains(fn ($mark) => $mark->marks_obtained === null || $mark->grade_point === null);
        $failed = $marks->contains(fn ($mark) => $mark->marks_obtained !== null && (
            $mark->grade === 'F'
            || (float) $mark->marks_obtained < (float) ($mark->pass_marks ?? (($mark->full_marks ?: 100) * .33))
        ));
        $gpa = $marks->isEmpty() ? 0 : $marks->sum('grade_point') / $marks->count();
        $grade = Grade::where('grade_point', '<=', $gpa)->orderByDesc('grade_point')->value('name');

        return [
            'total_marks' => $marks->sum('marks_obtained'),
            'gpa' => $incomplete ? 'N/A' : number_format($failed ? 0 : $gpa, 2),
            'letter_grade' => $incomplete ? 'N/A' : ($failed ? 'F' : ($grade ?? 'N/A')),
            'status' => $incomplete ? 'Pending' : ($failed ? 'Failed' : 'Passed'),
        ];
    }
}
