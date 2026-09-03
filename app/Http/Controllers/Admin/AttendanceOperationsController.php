<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\{AttendanceDayLock,AttendancePolicy,Event,SchoolClass};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
class AttendanceOperationsController extends Controller {
 public function index(){return Inertia::render('Admin/AttendanceOperations/Index',['policy'=>AttendancePolicy::where('is_active',true)->first(),'locks'=>AttendanceDayLock::latest('attendance_date')->take(60)->get(),'classes'=>SchoolClass::with('sections:id,name')->where('is_active',true)->get(['id','name']),'holidays'=>Event::where('is_government_holiday',true)->where('end_datetime','>=',now()->startOfYear())->orderBy('start_datetime')->get(['id','title','start_datetime','end_datetime'])]);}
 public function policy(Request $r){$d=$r->validate(['student_start_time'=>'required|date_format:H:i','staff_start_time'=>'required|date_format:H:i','late_grace_minutes'=>'required|integer|min:0|max:180','half_day_after_minutes'=>'required|integer|min:1|max:720','weekly_holidays'=>'array','weekly_holidays.*'=>['integer',Rule::in(range(0,6))],'block_holiday_entry'=>'boolean','auto_absent_sms'=>'boolean']);AttendancePolicy::query()->update(['is_active'=>false]);AttendancePolicy::create($d+['is_active'=>true]);return back()->with('success','Attendance policy saved.');}
 public function lock(Request $r){$d=$r->validate(['attendance_type'=>'required|in:student,staff','attendance_date'=>'required|date','class_id'=>'nullable|required_if:attendance_type,student|exists:school_classes,id','section_id'=>'nullable|exists:sections,id']);AttendanceDayLock::updateOrCreate(collect($d)->only(['attendance_type','attendance_date','class_id','section_id'])->all(),['locked_by'=>$r->user()->id,'locked_at'=>now()]);return back()->with('success','Attendance day locked.');}
 public function unlock(AttendanceDayLock $lock){$lock->delete();return back()->with('success','Attendance day reopened.');}
}
