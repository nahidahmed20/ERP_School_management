<?php

namespace App\Services;

use App\Models\{BiometricDevice,BiometricEnrolledUser,BiometricSyncLog,StaffAttendance,StudentAttendance};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BiometricAttendanceService
{
 public function ingest(BiometricDevice $device,array $punch):BiometricSyncLog
 {
  $biometricId=(string)($punch['biometric_id']??$punch['id']??$punch['uid']??''); $time=Carbon::parse($punch['punch_time']??$punch['timestamp']??$punch['time']??null);
  return DB::transaction(function()use($device,$punch,$biometricId,$time){
   $existing=BiometricSyncLog::where('device_id',$device->id)->where('biometric_id',$biometricId)->where('punch_time',$time)->first();if($existing)return $existing;
   $enrolled=BiometricEnrolledUser::where('biometric_id',$biometricId)->where('is_active',true)->first();
   $log=BiometricSyncLog::create(['campus_id'=>$device->campus_id,'device_id'=>$device->id,'enrolled_user_id'=>$enrolled?->id,'biometric_id'=>$biometricId,'punch_time'=>$time,'punch_state'=>$punch['state']??'Punch','sync_status'=>$enrolled?'Success':'Failed','error_message'=>$enrolled?null:'Biometric ID is not mapped to a user.','source_uid'=>$punch['uid']??null,'raw_data'=>$punch]);
   if(!$enrolled)return $log;
   $date=$time->toDateString();$clock=$time->format('H:i:s');
   if(strtolower($enrolled->user_type)==='staff'){
    $attendance=StaffAttendance::where('staff_id',$enrolled->user_id)->whereDate('date',$date)->first();
    if(!$attendance)$attendance=StaffAttendance::create(['staff_id'=>$enrolled->user_id,'date'=>$date,'status'=>'present','in_time'=>$clock,'source'=>'zkteco']);
    if(!$attendance->in_time||$clock<$attendance->in_time)$attendance->in_time=$clock;if($clock>$attendance->in_time)$attendance->out_time=$clock;$attendance->source=$attendance->source==='manual'?'manual+zkteco':'zkteco';$attendance->save();
   } elseif(strtolower($enrolled->user_type)==='student'){
    $student=\App\Models\Student::with('currentEnrollment')->find($enrolled->user_id);$enrollment=$student?->currentEnrollment;
    if(!$enrollment){$log->update(['sync_status'=>'Failed','error_message'=>'Student has no current enrollment.']);return $log;}
    StudentAttendance::firstOrCreate(['student_id'=>$enrolled->user_id,'attendance_date'=>$date],['school_class_id'=>$enrollment->class_id,'section_id'=>$enrollment->section_id,'academic_session_id'=>$enrollment->academic_session_id,'status'=>'present','source'=>'zkteco']);
   } else {$log->update(['sync_status'=>'Failed','error_message'=>'Unsupported user type.']);}
   return $log->fresh();
  });
 }
 public function ingestMany(BiometricDevice $device,array $punches):array { $ok=0;$failed=0;foreach($punches as $p){try{$this->ingest($device,$p)->sync_status==='Success'?$ok++:$failed++;}catch(\Throwable $e){$failed++;}}$device->update(['last_sync'=>now(),'status'=>'Online','last_error'=>null]);return compact('ok','failed'); }
}
