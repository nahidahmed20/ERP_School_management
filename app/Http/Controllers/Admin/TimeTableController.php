<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeTable;
use App\Models\SchoolClass;
use App\Models\Classroom;
use App\Models\Campus;
use Illuminate\Http\Request;
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

    // ২. নতুন রুটিন সেভ করা (Bulk Add)
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
        ], [
            'periods.*.subject_id.distinct' => 'একই দিনে একটি সাবজেক্ট একাধিকবার দেওয়া যাবে না!',
            'periods.*.end_time.after' => 'End time অবশ্যই Start time এর পরে হতে হবে।',
        ]);

        $campusId = $request->campus_id ?? config('app.active_campus_id');

        foreach ($request->periods as $period) {
            if (!empty($period['classroom_id'])) {
                $clash = TimeTable::with(['schoolClass', 'classroom'])
                    ->where('day_of_week', $request->day_of_week)
                    ->where('classroom_id', $period['classroom_id'])
                    ->where(function($q) use ($period) {
                        $q->where('start_time', '<', $period['end_time'])
                          ->where('end_time', '>', $period['start_time']);
                    })->first();

                if ($clash) {
                    return back()->with('error', 'রুম ' . $clash->classroom->room_number . ' এই সময়ে ' . $clash->schoolClass->name . ' এর জন্য বুক করা আছে!');
                }
            }
        }

        foreach ($request->periods as $period) {
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

        return back()->with('success', 'পুরো দিনের রুটিন সফলভাবে সেভ করা হয়েছে।');
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

        if (!empty($request->periods)) {
            foreach ($request->periods as $period) {
                if (!empty($period['classroom_id'])) {
                    $clash = TimeTable::with(['schoolClass', 'classroom'])
                        ->where('day_of_week', $request->day_of_week)
                        ->where('classroom_id', $period['classroom_id'])
                        ->where(function($q) use ($request) {
                            $q->where('class_id', '!=', $request->class_id)
                              ->orWhere('section_id', '!=', $request->section_id);
                        })
                        ->where(function($q) use ($period) {
                            $q->where('start_time', '<', $period['end_time'])
                              ->where('end_time', '>', $period['start_time']);
                        })->first();

                    if ($clash) {
                        return back()->with('error', 'রুম ' . $clash->classroom->room_number . ' এই সময়ে ' . $clash->schoolClass->name . ' এর জন্য বুক করা আছে!');
                    }
                }
            }
        }

        TimeTable::where('class_id', $request->class_id)
            ->where('section_id', $request->section_id)
            ->where('day_of_week', $request->day_of_week)
            ->delete();

        if (!empty($request->periods)) {
            foreach ($request->periods as $period) {
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

        return back()->with('success', $request->day_of_week . ' এর রুটিন সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $timeTable = TimeTable::findOrFail($id);
        $timeTable->delete();
        
        return back()->with('success', 'রুটিন থেকে পিরিয়ডটি মুছে ফেলা হয়েছে।');
    }
}