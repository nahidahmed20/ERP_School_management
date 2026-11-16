<?php
namespace Tests\Feature;
use App\Models\{BiometricDevice,BiometricEnrolledUser,Campus,Staff,StaffAttendance};use App\Services\BiometricAttendanceService;use Illuminate\Foundation\Testing\RefreshDatabase;use Illuminate\Support\Facades\DB;use Tests\TestCase;
class BiometricAttendanceTest extends TestCase{use RefreshDatabase;
 public function test_punches_are_campus_safe_idempotent_and_create_check_in_and_out():void{
  $campus=Campus::create(['name'=>'Main','code'=>'MAIN']);config(['app.active_campus_id'=>$campus->id]);
  $department=DB::table('departments')->insertGetId(['name'=>'Academic','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);$designation=DB::table('designations')->insertGetId(['name'=>'Teacher','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);
  $staff=Staff::create(['campus_id'=>$campus->id,'department_id'=>$department,'designation_id'=>$designation,'staff_id_no'=>'EMP-ZK','first_name'=>'ZK','gender'=>'male','date_of_birth'=>'1990-01-01','joining_date'=>'2020-01-01','phone'=>'01700000999','present_address'=>'Dhaka','permanent_address'=>'Dhaka','basic_salary'=>30000,'is_active'=>1]);
  $device=BiometricDevice::create(['campus_id'=>$campus->id,'name'=>'Test ZKTeco','ip_address'=>'127.0.0.1','port'=>'4370','serial_number'=>'SIM-1','status'=>'Offline']);BiometricEnrolledUser::create(['campus_id'=>$campus->id,'user_type'=>'staff','user_id'=>$staff->id,'user_name'=>'ZK User','biometric_id'=>'101','is_active'=>1]);$service=app(BiometricAttendanceService::class);
  $service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 08:00:00']);$service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 17:00:00']);$service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 17:00:00']);
  $attendance=StaffAttendance::first();$this->assertSame($campus->id,$attendance->campus_id);$this->assertSame('08:00:00',$attendance->in_time);$this->assertSame('17:00:00',$attendance->out_time);$this->assertDatabaseCount('staff_attendances',1);$this->assertDatabaseCount('biometric_sync_logs',2);
 }
 public function test_device_rejects_an_enrollment_from_another_campus():void{$a=Campus::create(['name'=>'A','code'=>'A']);$b=Campus::create(['name'=>'B','code'=>'B']);config(['app.active_campus_id'=>null]);$device=BiometricDevice::create(['campus_id'=>$a->id,'name'=>'A Device','serial_number'=>'A-DEV']);BiometricEnrolledUser::create(['campus_id'=>$b->id,'user_type'=>'staff','user_id'=>999,'user_name'=>'Wrong Campus','biometric_id'=>'55']);$log=app(BiometricAttendanceService::class)->ingest($device,['biometric_id'=>'55','punch_time'=>'2026-09-03 08:00:00']);$this->assertSame('Failed',$log->sync_status);$this->assertDatabaseCount('staff_attendances',0);}
}
