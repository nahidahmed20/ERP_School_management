<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $classId = $request->class_id;
        $sectionId = $request->section_id;
        $date = $request->date ?? date('Y-m-d');
        $students = [];

        if ($classId) {
            $students = Student::with(['currentEnrollment' => function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) {
                    $q->where('section_id', $sectionId);
                }
            }])
            ->whereHas('currentEnrollment', function($q) use ($classId, $sectionId) {
                $q->where('class_id', $classId);
                if ($sectionId) {
                    $q->where('section_id', $sectionId);
                }
            })
            ->get()
            ->map(function ($student) use ($date) {
                $attendance = StudentAttendance::where('student_id', $student->id)
                                ->where('attendance_date', $date)
                                ->first();

                $student->attendance_status = $attendance ? $attendance->status : 'present'; 
                $student->remarks = $attendance ? $attendance->remarks : '';
                
                $student->has_attendance = $attendance ? true : false; 
                return $student;
            });
        }

        return Inertia::render('Admin/Attendance/Index', [
            'classes'  => SchoolClass::with('sections')->where('is_active', true)->get(),
            'students' => $students,
            'filters'  => [
                'class_id'   => $classId ?? '',
                'section_id' => $sectionId ?? '',
                'date'       => $date,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'date'     => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,half_day',
        ]);

        $activeSession = AcademicSession::where('is_current', 1)->first();
        if (!$activeSession) return back()->with('error', 'কোনো অ্যাক্টিভ শিক্ষাবর্ষ পাওয়া যায়নি!');

        foreach ($request->attendances as $att) {
            StudentAttendance::updateOrCreate(
                [
                    'student_id'      => $att['student_id'],
                    'attendance_date' => $request->date,
                ],
                [
                    'school_class_id'     => $request->class_id,
                    'section_id'          => $request->section_id ?? null,
                    'academic_session_id' => $activeSession->id,
                    'status'              => $att['status'],
                    'remarks'             => $att['remarks'] ?? null,
                ]
            );
        }
        return back()->with('success', 'অ্যাটেনডেন্স সফলভাবে সেভ (Update) করা হয়েছে!');
    }

    public function destroy(Request $request)
    {
        $query = StudentAttendance::where('school_class_id', $request->class_id)
                                  ->where('attendance_date', $request->date);

        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }

        $query->delete();

        return back()->with('success', 'এই দিনের অ্যাটেনডেন্স রেকর্ড মুছে ফেলা (Delete) হয়েছে!');
    }

    public function sendAbsentSms(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'student_ids' => 'required|array',
        ]);

        $date = $request->date;
        $studentIds = $request->student_ids;

        $absentAttendances = StudentAttendance::where('attendance_date', $date)
            ->whereIn('student_id', $studentIds)
            ->where('status', 'absent') 
            ->with('student.guardian') 
            ->get();

        $smsCount = 0;

        foreach ($absentAttendances as $attendance) {
            $student = $attendance->student; 
            
            $guardian = $student->guardian ?? null;
            
            $phone = $guardian->father_phone ?? $guardian->mother_phone ?? $student->phone;

            if ($phone) {
                $formattedDate = \Carbon\Carbon::parse($date)->format('d-M-Y');
                
                $message = "সম্মানিত অভিভাবক, আপনার সন্তান {$student->first_name} আজ ({$formattedDate}) স্কুলে অনুপস্থিত। - স্কুল কর্তৃপক্ষ";
                
                SmsService::send($phone, $message);
                $smsCount++;
            }
        }

        return back()->with('success', "মোট {$smsCount} জন শিক্ষার্থীর অভিভাবককে সফলভাবে SMS পাঠানো হয়েছে!");
    }
}
