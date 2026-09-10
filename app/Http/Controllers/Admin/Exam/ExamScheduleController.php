<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\SchoolClass;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;
use App\Models\{Campus, ExamMark};
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class ExamScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = ExamSchedule::with(['exam', 'schoolClass', 'section', 'subject', 'classroom']);

        if ($request->filled('exam_id')) {
            $query->where('exam_id', $request->exam_id);
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        $query->orderBy('exam_date', 'asc')->orderBy('start_time', 'asc');

        return Inertia::render('Admin/Exams/Schedule/Index', [
            'schedules' => $query->get(),
            'exams' => Exam::where('is_active', true)->orderBy('id', 'desc')->get(),
            'classes' => SchoolClass::with(['sections:id,name', 'subjects:id,name'])->where('is_active', true)->orderBy('numeric_name')->get(),
            'classrooms' => Classroom::select('id', 'room_number', 'capacity')->where('is_active', true)->get(),
            'filters' => $request->only(['exam_id', 'class_id', 'section_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        
        $data['campus_id'] = config('app.active_campus_id');
        Exam::create($data);
        
        return back()->with('success', 'নতুন পরীক্ষা তৈরি করা হয়েছে। এবার রুটিন সেট করুন।');
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->validate([
            'exam_id' => ['required', CampusRule::exists('exams')],
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'section_id' => ['required', CampusRule::exists('sections')],
            'periods' => 'present|array',
            'periods.*.subject_id' => ['required', CampusRule::exists('subjects'), 'distinct'],
            'periods.*.exam_date' => 'required|date_format:Y-m-d',
            'periods.*.start_time' => 'required|date_format:H:i',
            'periods.*.end_time' => 'required|date_format:H:i|after:periods.*.start_time',
            'periods.*.classroom_id' => ['nullable', CampusRule::exists('classrooms')],
        ]);
        $class = SchoolClass::findOrFail($data['class_id']);
        if (! $class->sections()->whereKey($data['section_id'])->exists()) {
            throw ValidationException::withMessages(['section_id' => 'Select a section assigned to this class.']);
        }
        $subjects = $class->subjects()->pluck('subjects.id')->all();
        foreach ($data['periods'] as $index => $period) {
            if (! in_array((int) $period['subject_id'], $subjects)) {
                throw ValidationException::withMessages(["periods.$index.subject_id" => 'Select a subject assigned to this class.']);
            }
        }

        DB::transaction(function () use ($data, $class) {
            Campus::whereKey($class->campus_id)->lockForUpdate()->firstOrFail();
            $exam = Exam::whereKey($data['exam_id'])->lockForUpdate()->firstOrFail();
            $this->ensureEditable($exam, $class->id, $data['section_id']);
            ExamSchedule::where('exam_id', $exam->id)->where('class_id', $class->id)->where('section_id', $data['section_id'])->delete();
            foreach ($data['periods'] as $index => $period) {
                $date = Carbon::parse($period['exam_date']);
                if (($exam->start_date && $date->lt($exam->start_date)) || ($exam->end_date && $date->gt($exam->end_date))) {
                    throw ValidationException::withMessages(["periods.$index.exam_date" => 'Schedule date must fall within the exam date range.']);
                }
                $start = $period['start_time'].':00';
                $end = $period['end_time'].':00';
                $clash = ExamSchedule::where('exam_date', $period['exam_date'])
                    ->where('start_time', '<', $end)->where('end_time', '>', $start)
                    ->where(function ($query) use ($class, $data, $period) {
                        $query->where(fn ($query) => $query->where('class_id', $class->id)->where('section_id', $data['section_id']));
                        if (! empty($period['classroom_id'])) $query->orWhere('classroom_id', $period['classroom_id']);
                    })->exists();
                if ($clash) {
                    throw ValidationException::withMessages(["periods.$index.start_time" => 'The selected class/section or room has an overlapping exam.']);
                }
                ExamSchedule::create([
                    'campus_id' => $class->campus_id, 'exam_id' => $exam->id, 'class_id' => $class->id,
                    'section_id' => $data['section_id'], 'subject_id' => $period['subject_id'],
                    'classroom_id' => $period['classroom_id'] ?? null, 'exam_date' => $period['exam_date'],
                    'start_time' => $start, 'end_time' => $end,
                ]);
            }
        });
        return back()->with('success', 'Exam schedule saved successfully.');
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            $schedule = ExamSchedule::findOrFail($id);
            $exam = Exam::whereKey($schedule->exam_id)->lockForUpdate()->firstOrFail();
            $this->ensureEditable($exam, $schedule->class_id, $schedule->section_id);
            $schedule->delete();
        });
        return back()->with('success', 'Subject removed from the exam schedule.');
    }

    private function ensureEditable(Exam $exam, int $classId, int $sectionId): void
    {
        if ($exam->approval_status !== 'draft' || $exam->results_published) {
            throw ValidationException::withMessages(['exam_id' => 'Only draft exam schedules can be changed.']);
        }
        if (ExamMark::where('exam_id', $exam->id)->where('school_class_id', $classId)->where('section_id', $sectionId)->exists()) {
            throw ValidationException::withMessages(['exam_id' => 'This schedule already has marks. Clear draft marks before changing its subjects or dates.']);
        }
    }
}
