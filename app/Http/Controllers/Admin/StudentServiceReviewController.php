<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AttendanceCorrectionRequest, HomeworkSubmission, LibraryReservation, StudentAttendance, StudentLeaveRequest, StudentProfileUpdateRequest};
use Carbon\CarbonPeriod;
use App\Models\Student;
use App\Services\StudentAttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentServiceReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Students/Services/Index',[
            'homework'=>HomeworkSubmission::with(['student:id,first_name,last_name,admission_no','homework:id,title,total_marks'])->latest()->take(100)->get(),
            'leaves'=>StudentLeaveRequest::with('student:id,first_name,last_name,admission_no')->latest()->take(100)->get(),
            'corrections'=>AttendanceCorrectionRequest::with('student:id,first_name,last_name,admission_no')->latest()->take(100)->get(),
            'profiles'=>StudentProfileUpdateRequest::with('student:id,first_name,last_name,admission_no')->latest()->take(100)->get(),
            'reservations'=>LibraryReservation::with(['book:id,title'])->latest()->take(100)->get(),
        ]);
    }
    public function homework(Request $request, HomeworkSubmission $submission)
    {
        $data=$request->validate(['marks_obtained'=>['nullable','numeric','min:0','max:'.$submission->homework->total_marks],'teacher_feedback'=>'nullable|string|max:3000','status'=>'required|in:Evaluated,Needs Revision']);
        $submission->update($data+['evaluated_at'=>now()]); return back()->with('success','Homework reviewed.');
    }
    public function leave(Request $request, StudentLeaveRequest $leave, StudentAttendanceService $service)
    {
        $data=$request->validate(['status'=>'required|in:Approved,Rejected','review_note'=>'nullable|string|max:2000']);
        DB::transaction(function () use ($leave, $data, $service) {
            $leave = StudentLeaveRequest::whereKey($leave->id)->lockForUpdate()->firstOrFail();
            abort_unless($leave->school_status === 'Pending', 422, 'This leave request has already been reviewed.');
            if ($data['status'] === 'Approved') {
                abort_if($leave->parent_status === 'Rejected', 422, 'Guardian rejected this leave request.');
                abort_if($leave->start_date->diffInDays($leave->end_date) > 366, 422, 'A leave request cannot exceed one year.');
                $student = Student::whereKey($leave->student_id)->lockForUpdate()->firstOrFail();
                foreach (CarbonPeriod::create($leave->start_date, $leave->end_date) as $day) {
                    // Future leave is applied when the daily sheet is saved, never counted as an absence early.
                    if ($day->isFuture() && ! $day->isToday()) continue;
                    $date = $day->toDateString();
                    if ($service->isHoliday($date)) continue;
                    $attendance = StudentAttendance::where('student_id', $student->id)->whereDate('attendance_date', $date)->lockForUpdate()->first();
                    // Leave approval must not erase evidence that the student attended.
                    if ($attendance && ($attendance->status !== 'absent' || $service->isProtected($attendance))) continue;
                    $enrollment = $attendance ?: $service->enrollmentForDate($student, $date);
                    $classId = $attendance?->school_class_id ?? $enrollment->class_id;
                    abort_if($service->isLocked($date, $classId, $enrollment->section_id), 422, 'Reopen the locked attendance sheet before approving this leave.');
                    StudentAttendance::updateOrCreate(['student_id' => $student->id, 'attendance_date' => $date], [
                        'campus_id' => $student->campus_id, 'school_class_id' => $classId,
                        'section_id' => $enrollment->section_id, 'academic_session_id' => $enrollment->academic_session_id,
                        'status' => 'absent', 'is_excused' => true, 'source' => 'approved_leave',
                        'recorded_by' => auth()->id(), 'verified_at' => now(), 'remarks' => 'Approved student leave #'.$leave->id,
                    ]);
                }
            }
            $leave->update(['school_status' => $data['status'], 'review_note' => $data['review_note'] ?? null, 'reviewed_by' => auth()->id()]);
        }, 3);
        return back()->with('success','Leave reviewed.');
    }
    public function correction(Request $request, AttendanceCorrectionRequest $correction, StudentAttendanceService $service)
    {
        abort_unless($correction->status==='Pending',422,'This correction request has already been reviewed.');
        $data=$request->validate(['status'=>'required|in:Approved,Rejected','review_note'=>'nullable|string|max:2000']);
        DB::transaction(function () use ($correction, $data, $service) {
            $correction = AttendanceCorrectionRequest::whereKey($correction->id)->lockForUpdate()->firstOrFail();
            abort_unless($correction->status === 'Pending', 422, 'This correction request has already been reviewed.');
            if ($data['status'] === 'Approved') {
                abort_if($correction->attendance_date->isAfter(today()), 422, 'Future attendance cannot be corrected.');
                abort_unless(in_array($correction->requested_status, ['present', 'absent', 'late', 'half_day', 'leave'], true), 422, 'Invalid attendance status.');
                $student = Student::whereKey($correction->student_id)->lockForUpdate()->firstOrFail();
                $date = $correction->attendance_date->toDateString();
                $attendance = StudentAttendance::where('student_id', $student->id)->whereDate('attendance_date', $date)->lockForUpdate()->first();
                abort_if($attendance && $attendance->status !== $correction->current_status, 422, 'Attendance changed after this request. Ask the student to refresh the pending request.');
                // Preserve the class/session of historical records after promotion or transfer.
                $enrollment = $attendance ?: $service->enrollmentForDate($student, $date);
                $classId = $attendance?->school_class_id ?? $enrollment->class_id;
                abort_if($service->isLocked($date, $classId, $enrollment->section_id), 422, 'Reopen the locked attendance sheet before approving this correction.');
                $isLeave = $correction->requested_status === 'leave';
                StudentAttendance::updateOrCreate(['student_id' => $student->id, 'attendance_date' => $date], [
                    'campus_id' => $student->campus_id, 'school_class_id' => $classId,
                    'section_id' => $enrollment->section_id, 'academic_session_id' => $enrollment->academic_session_id,
                    'status' => $isLeave ? 'absent' : $correction->requested_status, 'is_excused' => $isLeave,
                    'source' => 'approved_correction', 'recorded_by' => auth()->id(), 'verified_at' => now(),
                    'remarks' => 'Approved correction #'.$correction->id,
                ]);
            }
            $correction->update($data + ['reviewed_by' => auth()->id()]);
        }, 3);
        return back()->with('success','Attendance request reviewed.');
    }
    public function profile(Request $request, StudentProfileUpdateRequest $profile)
    {
        $data=$request->validate(['status'=>'required|in:Approved,Rejected','review_note'=>'nullable|string|max:2000']);
        DB::transaction(function()use($profile,$data){$profile->update($data+['reviewed_by'=>auth()->id()]);if($data['status']==='Approved')$profile->student->update(collect($profile->changes)->only(['phone','email','present_address','permanent_address'])->all());});
        return back()->with('success','Profile request reviewed.');
    }
    public function reservation(Request $request, LibraryReservation $reservation)
    {
        $data=$request->validate(['status'=>'required|in:Approved,Rejected,Fulfilled,Cancelled','note'=>'nullable|string|max:1000']);$reservation->update($data);return back()->with('success','Reservation updated.');
    }
}
