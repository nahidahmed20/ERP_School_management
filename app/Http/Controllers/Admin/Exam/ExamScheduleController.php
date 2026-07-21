<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\SchoolClass;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'periods' => 'nullable|array',
            'periods.*.subject_id' => 'required_with:periods|exists:subjects,id|distinct',
            'periods.*.exam_date' => 'required_with:periods|date',
            'periods.*.start_time' => 'required_with:periods|date_format:H:i',
            'periods.*.end_time' => 'required_with:periods|date_format:H:i|after:periods.*.start_time',
            'periods.*.classroom_id' => 'nullable|exists:classrooms,id',
        ], [
            'periods.*.subject_id.distinct' => 'একই সাবজেক্টের পরীক্ষা একাধিকবার নেওয়া যাবে না!',
        ]);

        if (!empty($request->periods)) {
            foreach ($request->periods as $period) {
                if (!empty($period['classroom_id'])) {
                    $clash = ExamSchedule::with(['schoolClass', 'classroom'])
                        ->where('exam_date', $period['exam_date'])
                        ->where('classroom_id', $period['classroom_id'])
                        ->where(function($q) use ($request) {
                            $q->where('class_id', '!=', $request->class_id)
                              ->orWhere('section_id', '!=', $request->section_id)
                              ->orWhere('exam_id', '!=', $request->exam_id);
                        })
                        ->where(function($q) use ($period) {
                            $q->where('start_time', '<', $period['end_time'])
                              ->where('end_time', '>', $period['start_time']);
                        })->first();

                    if ($clash) {
                        return back()->with('error', 'রুম ' . $clash->classroom->room_number . ' এই তারিখে ' . $clash->schoolClass->name . ' এর পরীক্ষার জন্য বুক করা আছে!');
                    }
                }
            }
        }

        ExamSchedule::where('exam_id', $request->exam_id)
            ->where('class_id', $request->class_id)
            ->where('section_id', $request->section_id)
            ->delete();

        if (!empty($request->periods)) {
            foreach ($request->periods as $period) {
                ExamSchedule::create([
                    'exam_id' => $request->exam_id,
                    'class_id' => $request->class_id,
                    'section_id' => $request->section_id,
                    'subject_id' => $period['subject_id'],
                    'classroom_id' => $period['classroom_id'] ?? null,
                    'exam_date' => $period['exam_date'],
                    'start_time' => $period['start_time'],
                    'end_time' => $period['end_time'],
                ]);
            }
        }

        return back()->with('success', 'পরীক্ষার রুটিন সফলভাবে সেভ করা হয়েছে।');
    }

    public function destroy($id)
    {
        ExamSchedule::findOrFail($id)->delete();
        return back()->with('success', 'পরীক্ষার রুটিন থেকে সাবজেক্টটি মুছে ফেলা হয়েছে।');
    }
}