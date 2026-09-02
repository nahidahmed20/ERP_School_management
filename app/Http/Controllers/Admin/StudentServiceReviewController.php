<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AttendanceCorrectionRequest, HomeworkSubmission, LibraryReservation, StudentAttendance, StudentLeaveRequest, StudentProfileUpdateRequest};
use Carbon\CarbonPeriod;
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
    public function leave(Request $request, StudentLeaveRequest $leave)
    {
        $data=$request->validate(['status'=>'required|in:Approved,Rejected','review_note'=>'nullable|string|max:2000']);
        DB::transaction(function()use($leave,$data){$leave->update(['school_status'=>$data['status'],'review_note'=>$data['review_note']??null,'reviewed_by'=>auth()->id()]);if($data['status']==='Approved'){$enrollment=$leave->student->currentEnrollment;abort_unless($enrollment,422,'Student enrollment missing.');foreach(CarbonPeriod::create($leave->start_date,$leave->end_date) as $date)StudentAttendance::updateOrCreate(['student_id'=>$leave->student_id,'attendance_date'=>$date->toDateString()],['school_class_id'=>$enrollment->class_id,'section_id'=>$enrollment->section_id,'academic_session_id'=>$enrollment->academic_session_id,'status'=>'absent','is_excused'=>true,'remarks'=>'Approved student leave #'.$leave->id]);}});
        return back()->with('success','Leave reviewed.');
    }
    public function correction(Request $request, AttendanceCorrectionRequest $correction)
    {
        $data=$request->validate(['status'=>'required|in:Approved,Rejected','review_note'=>'nullable|string|max:2000']);
        DB::transaction(function()use($correction,$data){$correction->update($data+['reviewed_by'=>auth()->id()]);if($data['status']==='Approved'){$enrollment=$correction->student->currentEnrollment;abort_unless($enrollment,422,'Student enrollment missing.');$isLeave=$correction->requested_status==='leave';StudentAttendance::updateOrCreate(['student_id'=>$correction->student_id,'attendance_date'=>$correction->attendance_date],['school_class_id'=>$enrollment->class_id,'section_id'=>$enrollment->section_id,'academic_session_id'=>$enrollment->academic_session_id,'status'=>$isLeave?'absent':$correction->requested_status,'is_excused'=>$isLeave,'remarks'=>'Approved correction #'.$correction->id]);}});
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
