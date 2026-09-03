<?php
namespace Tests\Feature;
use App\Models\{BiometricDevice,BiometricEnrolledUser,Staff,StaffAttendance};use App\Services\BiometricAttendanceService;use Illuminate\Foundation\Testing\RefreshDatabase;use Illuminate\Support\Facades\DB;use Tests\TestCase;
class BiometricAttendanceTest extends TestCase { use RefreshDatabase;
 public function test_punches_are_idempotent_and_create_check_in_and_out():void {
  $department=DB::table('departments')->insertGetId(['name'=>'Academic','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);$designation=DB::table('designations')->insertGetId(['name'=>'Teacher','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);
  $staff=Staff::create(['department_id'=>$department,'designation_id'=>$designation,'staff_id_no'=>'EMP-ZK','first_name'=>'ZK','gender'=>'male','date_of_birth'=>'1990-01-01','joining_date'=>'2020-01-01','phone'=>'01700000999','present_address'=>'Dhaka','permanent_address'=>'Dhaka','basic_salary'=>30000,'is_active'=>1]);
  $device=BiometricDevice::create(['name'=>'Test ZKTeco','ip_address'=>'127.0.0.1','port'=>'4370','serial_number'=>'SIM-1','status'=>'Offline']);BiometricEnrolledUser::create(['user_type'=>'staff','user_id'=>$staff->id,'user_name'=>'ZK User','biometric_id'=>'101','is_active'=>1]);$service=app(BiometricAttendanceService::class);
  $service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 08:00:00']);$service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 17:00:00']);$service->ingest($device,['biometric_id'=>'101','punch_time'=>'2026-09-03 17:00:00']);
  $attendance=StaffAttendance::first();$this->assertSame('08:00:00',$attendance->in_time);$this->assertSame('17:00:00',$attendance->out_time);$this->assertDatabaseCount('staff_attendances',1);$this->assertDatabaseCount('biometric_sync_logs',2);
 }
}
