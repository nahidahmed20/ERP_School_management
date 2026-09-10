<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Campus, Classroom, SchoolClass, Staff, TimeTable};
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TimeTableController extends Controller
{
    private const DAYS = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday';

    public function index(Request $request)
    {
        $query = TimeTable::with(['schoolClass:id,name', 'section:id,name', 'subject:id,name', 'classroom:id,room_number', 'teacher:id,first_name,last_name,staff_id_no']);
        foreach (['class_id', 'section_id'] as $field) {
            $query->when($request->filled($field), fn ($q) => $q->where($field, $request->$field));
        }
        $query->when($request->filled('day'), fn ($q) => $q->where('day_of_week', $request->day));
        $query->orderByRaw("CASE day_of_week WHEN 'Sunday' THEN 0 WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 END")
            ->orderBy('start_time');

        return Inertia::render('Admin/TimeTables/Index', [
            'timeTables' => $query->paginate(50)->withQueryString(),
            'classes' => SchoolClass::with('sections:id,name')->where('is_active', true)->orderBy('numeric_name')->get(),
            'filters' => $request->only(['class_id', 'section_id', 'day']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TimeTables/Create', $this->formOptions());
    }

    public function editDay(Request $request)
    {
        $request->validate([
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'section_id' => ['required', CampusRule::exists('sections')],
            'day' => 'required|in:'.self::DAYS,
        ]);
        $this->validateClassSection($request->class_id, $request->section_id);

        return Inertia::render('Admin/TimeTables/Edit', $this->formOptions() + [
            'editData' => [
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'day_of_week' => $request->day,
                'periods' => TimeTable::where('class_id', $request->class_id)->where('section_id', $request->section_id)
                    ->where('day_of_week', $request->day)->orderBy('start_time')->get(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->saveDay($request, false);
        return back()->with('success', 'Class routine saved successfully.');
    }

    public function bulkUpdate(Request $request)
    {
        $this->saveDay($request, true);
        return back()->with('success', 'Class routine updated successfully.');
    }

    public function destroy($id)
    {
        TimeTable::findOrFail($id)->delete();
        return back()->with('success', 'Period removed from the class routine.');
    }

    private function formOptions(): array
    {
        return [
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::with(['sections', 'subjects'])->where('is_active', true)->orderBy('numeric_name')->get(),
            'classrooms' => Classroom::where('is_active', true)->get(['id', 'room_number', 'type']),
            'staffList' => Staff::where('is_active', true)->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'staff_id_no']),
        ];
    }

    private function validateClassSection($classId, $sectionId): SchoolClass
    {
        $class = SchoolClass::findOrFail($classId);
        if (! $class->sections()->whereKey($sectionId)->exists()) {
            throw ValidationException::withMessages(['section_id' => 'Select a section assigned to this class.']);
        }
        return $class;
    }

    private function saveDay(Request $request, bool $replace): void
    {
        $data = $request->validate([
            'class_id' => ['required', CampusRule::exists('school_classes')],
            'section_id' => ['required', CampusRule::exists('sections')],
            'day_of_week' => 'required|in:'.self::DAYS,
            'periods' => $replace ? 'present|array' : 'required|array|min:1',
            'periods.*.subject_id' => ['required', CampusRule::exists('subjects')],
            'periods.*.classroom_id' => ['nullable', CampusRule::exists('classrooms')],
            'periods.*.teacher_id' => ['nullable', CampusRule::exists('staff')],
            'periods.*.start_time' => 'required|date_format:H:i',
            'periods.*.end_time' => 'required|date_format:H:i|after:periods.*.start_time',
        ]);
        $class = $this->validateClassSection($data['class_id'], $data['section_id']);
        $subjectIds = $class->subjects()->pluck('subjects.id')->all();
        foreach ($data['periods'] as $index => $period) {
            if (! in_array((int) $period['subject_id'], $subjectIds)) {
                throw ValidationException::withMessages(["periods.$index.subject_id" => 'Select a subject assigned to this class.']);
            }
        }

        DB::transaction(function () use ($data, $class, $replace) {
            // Lock shared resources before checking or replacing any slots.
            Staff::whereIn('id', collect($data['periods'])->pluck('teacher_id')->filter())->orderBy('id')->lockForUpdate()->get();
            Classroom::whereIn('id', collect($data['periods'])->pluck('classroom_id')->filter())->orderBy('id')->lockForUpdate()->get();
            SchoolClass::whereKey($class->id)->lockForUpdate()->firstOrFail();

            if ($replace) {
                TimeTable::where('class_id', $class->id)->where('section_id', $data['section_id'])
                    ->where('day_of_week', $data['day_of_week'])->delete();
            }

            foreach ($data['periods'] as $period) {
                $start = $period['start_time'].':00';
                $end = $period['end_time'].':00';
                $clash = TimeTable::where('day_of_week', $data['day_of_week'])
                    ->where('start_time', '<', $end)->where('end_time', '>', $start)
                    ->where(function ($q) use ($period, $data, $class) {
                        $q->where(fn ($q) => $q->where('class_id', $class->id)->where('section_id', $data['section_id']));
                        if (! empty($period['teacher_id'])) $q->orWhere('teacher_id', $period['teacher_id']);
                        if (! empty($period['classroom_id'])) $q->orWhere('classroom_id', $period['classroom_id']);
                    })->exists();
                if ($clash) {
                    throw ValidationException::withMessages(['conflict' => 'This class, teacher or room already has a period during the selected time.']);
                }
                TimeTable::create([
                    'campus_id' => $class->campus_id,
                    'class_id' => $class->id,
                    'section_id' => $data['section_id'],
                    'day_of_week' => $data['day_of_week'],
                    'subject_id' => $period['subject_id'],
                    'teacher_id' => $period['teacher_id'] ?? null,
                    'classroom_id' => $period['classroom_id'] ?? null,
                    'start_time' => $start,
                    'end_time' => $end,
                ]);
            }
        });
    }
}
