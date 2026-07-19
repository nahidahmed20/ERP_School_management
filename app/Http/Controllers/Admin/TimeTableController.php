<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use App\Models\Classroom;
use App\Models\SchoolClass;
use App\Models\TimeTable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TimeTableController extends Controller
{
    public function index(Request $request)
    {
        $query = TimeTable::with(['schoolClass', 'section', 'subject', 'classroom']);

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->filled('day')) {
            $query->where('day_of_week', $request->day);
        }

        $query->orderByRaw("FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')")
              ->orderBy('start_time', 'asc');

        $timeTables = $query->paginate(50)->withQueryString();

        return Inertia::render('Admin/TimeTables/Index', [
            'timeTables' => $timeTables,
            'campuses' => Campus::select('id', 'name')->get(),
            'classes' => SchoolClass::with(['sections:id,name', 'subjects:id,name'])
                            ->where('is_active', true)
                            ->orderBy('numeric_name')
                            ->get(),
            'classrooms' => Classroom::select('id', 'room_number', 'type')
                            ->where('is_active', true)
                            ->get(),
            'filters' => $request->only(['class_id', 'section_id', 'day']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'day_of_week' => 'required|string|in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'periods' => 'required|array|min:1',
            'periods.*.subject_id' => 'required|exists:subjects,id|distinct',
            'periods.*.classroom_id' => 'nullable|exists:classrooms,id',
            'periods.*.start_time' => 'required|date_format:H:i',
            'periods.*.end_time' => 'required|date_format:H:i|after:periods.*.start_time',
        ]);

        $campusId = $request->campus_id ?? config('app.active_campus_id');
        $periods = $request->periods ?? [];

        for ($i = 0; $i < count($periods); $i++) {
            for ($j = $i + 1; $j < count($periods); $j++) {
                $p1Start = Carbon::parse($periods[$i]['start_time'])->format('H:i:s');
                $p1End = Carbon::parse($periods[$i]['end_time'])->format('H:i:s');
                $p2Start = Carbon::parse($periods[$j]['start_time'])->format('H:i:s');
                $p2End = Carbon::parse($periods[$j]['end_time'])->format('H:i:s');

                if ($p1Start < $p2End && $p1End > $p2Start) {
                    throw ValidationException::withMessages([
                        'conflict' => "ফর্মের পিরিয়ড " . ($i + 1) . " এবং " . ($j + 1) . " এর সময় ওভারল্যাপ করছে!"
                    ]);
                }
            }
        }

        foreach ($periods as $period) {
            if (!empty($period['classroom_id'])) {
                $start = Carbon::parse($period['start_time'])->format('H:i:s');
                $end = Carbon::parse($period['end_time'])->format('H:i:s');

                $clash = TimeTable::with(['schoolClass', 'section', 'classroom'])
                    ->where('campus_id', $campusId)
                    ->where('day_of_week', $request->day_of_week)
                    ->where('classroom_id', $period['classroom_id'])
                    ->where(function($q) use ($start, $end) {
                        $q->where('start_time', '<', $end)
                          ->where('end_time', '>', $start);
                    })->first();

                if ($clash) {
                    $clashTime = Carbon::parse($clash->start_time)->format('h:i A') . ' - ' . Carbon::parse($clash->end_time)->format('h:i A');
                    throw ValidationException::withMessages([
                        'conflict' => "রুম {$clash->classroom->room_number} এই সময়ে ({$clashTime}) {$clash->schoolClass->name} (Sec: {$clash->section->name}) এর জন্য বুক করা আছে!"
                    ]);
                }
            }
        }

        foreach ($periods as $period) {
            TimeTable::create([
                'campus_id' => $campusId,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'day_of_week' => $request->day_of_week,
                'subject_id' => $period['subject_id'],
                'classroom_id' => $period['classroom_id'] ?? null,
                'start_time' => $period['start_time'],
                'end_time' => $period['end_time'],
            ]);
        }

        return back()->with('success', 'রুটিন সফলভাবে সেভ করা হয়েছে।');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'day_of_week' => 'required|string|in:Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'periods' => 'nullable|array',
            'periods.*.subject_id' => 'required_with:periods|exists:subjects,id|distinct',
            'periods.*.start_time' => 'required_with:periods|date_format:H:i',
            'periods.*.end_time' => 'required_with:periods|date_format:H:i|after:periods.*.start_time',
        ], [
            'periods.*.subject_id.distinct' => 'একই দিনে একটি সাবজেক্ট একাধিকবার দেওয়া যাবে না!',
        ]);

        $campusId = $request->campus_id ?? config('app.active_campus_id');
        $periods = $request->periods ?? [];

        for ($i = 0; $i < count($periods); $i++) {
            for ($j = $i + 1; $j < count($periods); $j++) {
                $p1Start = Carbon::parse($periods[$i]['start_time'])->format('H:i:s');
                $p1End = Carbon::parse($periods[$i]['end_time'])->format('H:i:s');
                $p2Start = Carbon::parse($periods[$j]['start_time'])->format('H:i:s');
                $p2End = Carbon::parse($periods[$j]['end_time'])->format('H:i:s');

                if ($p1Start < $p2End && $p1End > $p2Start) {
                    throw ValidationException::withMessages([
                        'conflict' => "ফর্মের পিরিয়ড " . ($i + 1) . " এবং " . ($j + 1) . " এর সময় ওভারল্যাপ করছে!"
                    ]);
                }
            }
        }

        if (!empty($periods)) {
            foreach ($periods as $period) {
                if (!empty($period['classroom_id'])) {
                    $start = Carbon::parse($period['start_time'])->format('H:i:s');
                    $end = Carbon::parse($period['end_time'])->format('H:i:s');

                    $clash = TimeTable::with(['schoolClass', 'section', 'classroom'])
                        ->where('campus_id', $campusId)
                        ->where('day_of_week', $request->day_of_week)
                        ->where('classroom_id', $period['classroom_id'])
                        ->where(function($q) use ($request) {
                            $q->where('class_id', '!=', $request->class_id)
                              ->orWhere('section_id', '!=', $request->section_id);
                        })
                        ->where(function($q) use ($start, $end) {
                            $q->where('start_time', '<', $end)
                              ->where('end_time', '>', $start);
                        })->first();

                    if ($clash) {
                        $clashTime = Carbon::parse($clash->start_time)->format('h:i A') . ' - ' . Carbon::parse($clash->end_time)->format('h:i A');
                        throw ValidationException::withMessages([
                            'conflict' => "রুম {$clash->classroom->room_number} এই সময়ে ({$clashTime}) {$clash->schoolClass->name} (Sec: {$clash->section->name}) এর জন্য বুক করা আছে!"
                        ]);
                    }
                }
            }
        }

        TimeTable::where('class_id', $request->class_id)
            ->where('section_id', $request->section_id)
            ->where('day_of_week', $request->day_of_week)
            ->delete();

        if (!empty($periods)) {
            foreach ($periods as $period) {
                TimeTable::create([
                    'campus_id' => $campusId,
                    'class_id' => $request->class_id,
                    'section_id' => $request->section_id,
                    'day_of_week' => $request->day_of_week,
                    'subject_id' => $period['subject_id'],
                    'classroom_id' => $period['classroom_id'] ?? null,
                    'start_time' => $period['start_time'],
                    'end_time' => $period['end_time'],
                ]);
            }
        }

        return back()->with('success', $request->day_of_week . ' এর রুটিন সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $timeTable = TimeTable::findOrFail($id);
        $timeTable->delete();

        return back()->with('success', 'রুটিন থেকে পিরিয়ডটি মুছে ফেলা হয়েছে।');
    }
}
