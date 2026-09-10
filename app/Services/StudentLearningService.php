<?php

namespace App\Services;

use App\Models\{ExamSchedule, Homework, LessonPlan, Student, StudyMaterial, SyllabusTopic, TimeTable};
use Illuminate\Database\Eloquent\Builder;

class StudentLearningService
{
    public function homework(Student $student): Builder
    {
        return $this->forClass(Homework::query(), $student, 'school_class_id', true)->where('is_active', true);
    }

    public function routine(Student $student): Builder
    {
        return $this->forClass(TimeTable::query(), $student, 'class_id', true);
    }

    public function exams(Student $student): Builder
    {
        return $this->forClass(ExamSchedule::query(), $student, 'class_id', true)
            ->whereHas('exam', fn ($query) => $query->where('is_active', true));
    }

    public function materials(Student $student): Builder
    {
        $classId = $student->currentEnrollment?->class_id;

        // Study materials inherit campus ownership from their class.
        return StudyMaterial::where('class_id', $classId)
            ->whereHas('schoolClass', fn ($query) => $query->where('campus_id', $student->campus_id))
            ->when(! $classId, fn ($query) => $query->whereRaw('1 = 0'));
    }

    public function lessons(Student $student): Builder
    {
        return $this->forClass(LessonPlan::query(), $student)
            ->where(fn ($query) => $query->whereNull('academic_session_id')
                ->orWhere('academic_session_id', $student->currentEnrollment?->academic_session_id));
    }

    public function topics(Student $student): Builder
    {
        return $this->forClass(SyllabusTopic::query(), $student, 'class_id', true)
            ->where('academic_session_id', $student->currentEnrollment?->academic_session_id);
    }

    private function forClass(Builder $query, Student $student, string $classColumn = 'class_id', bool $section = false): Builder
    {
        $enrollment = $student->currentEnrollment;
        $query->where('campus_id', $student->campus_id)->where($classColumn, $enrollment?->class_id);
        if (! $enrollment || (int) $enrollment->campus_id !== (int) $student->campus_id) {
            return $query->whereRaw('1 = 0');
        }
        if ($section) {
            $query->where(fn ($q) => $q->whereNull('section_id')->orWhere('section_id', $enrollment->section_id));
        }

        return $query;
    }

    public function overview(Student $student): array
    {
        $student->loadMissing('currentEnrollment.schoolClass', 'currentEnrollment.section');

        return [
            'student' => [
                'name' => trim($student->first_name.' '.$student->last_name),
                'admission_no' => $student->admission_no,
                'class' => $student->currentEnrollment?->schoolClass?->name,
                'section' => $student->currentEnrollment?->section?->name,
            ],
            'routine' => $this->routine($student)->with('subject:id,name', 'teacher:id,first_name,last_name', 'classroom:id,room_number')
                ->orderBy('start_time')->get()->map(fn ($period) => [
                    'id' => $period->id, 'day' => $period->day_of_week,
                    'subject' => $period->subject?->name, 'teacher' => trim($period->teacher?->first_name.' '.$period->teacher?->last_name),
                    'room' => $period->classroom?->room_number, 'start' => $period->start_time, 'end' => $period->end_time,
                ]),
            'examSchedules' => $this->exams($student)->with('exam:id,name', 'subject:id,name', 'classroom:id,room_number')
                ->whereDate('exam_date', '>=', today())->orderBy('exam_date')->orderBy('start_time')->get(),
            'syllabus' => $this->lessons($student)->with('subject:id,name')->orderBy('title')->get()->map(fn ($lesson) => [
                'id' => $lesson->id, 'title' => $lesson->title, 'description' => $lesson->description,
                'status' => $lesson->status, 'subject' => $lesson->subject?->name,
                'download_url' => $lesson->attachment ? $this->downloadUrl($student, 'syllabus', $lesson->id) : null,
            ]),
            'syllabusTopics' => $this->topics($student)->orderBy('planned_date')->get(['id', 'subject_id', 'title', 'status', 'planned_date']),
            'materials' => $this->materials($student)->with('subject:id,name')->latest()->get()->map(fn ($item) => [
                'id' => $item->id, 'title' => $item->title, 'subject' => $item->subject?->name,
                'description' => $item->description, 'file_type' => $item->file_type,
                'download_url' => $this->downloadUrl($student, 'material', $item->id),
            ]),
        ];
    }

    public function downloadUrl(Student $student, string $kind, int $record): string
    {
        return route('portal.learning.download', ['student' => $student->id, 'kind' => $kind, 'record' => $record]);
    }
}
