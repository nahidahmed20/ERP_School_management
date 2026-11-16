<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\User;
use App\Services\PayrollService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AutomaticPayrollTest extends TestCase
{
    use RefreshDatabase;

    public function test_absence_override_and_hourly_overtime_are_calculated(): void
    {
        $user=User::factory()->create();
        $department=DB::table('departments')->insertGetId(['name'=>'Academic','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $designation=DB::table('designations')->insertGetId(['name'=>'Teacher','is_active'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $staff=Staff::create(['department_id'=>$department,'designation_id'=>$designation,'staff_id_no'=>'EMP-1','first_name'=>'Test','gender'=>'male','date_of_birth'=>'1990-01-01','joining_date'=>'2020-01-01','phone'=>'01700000001','present_address'=>'Dhaka','permanent_address'=>'Dhaka','basic_salary'=>30000,'is_active'=>1]);
        StaffAttendance::create(['staff_id'=>$staff->id,'date'=>'2026-08-03','status'=>'absent','salary_paid_override'=>false]);
        StaffAttendance::create(['staff_id'=>$staff->id,'date'=>'2026-08-04','status'=>'absent','salary_paid_override'=>true]);
        StaffAttendance::create(['staff_id'=>$staff->id,'date'=>'2026-08-05','status'=>'present','overtime_hours'=>2]);

        $payroll=app(PayrollService::class)->generate($staff,'2026-08',['working_days'=>30,'overtime_enabled'=>true,'overtime_mode'=>'hour','overtime_rate'=>100,'overtime_multiplier'=>1.5,'allowance'=>0,'deduction'=>0],$user->id);

        $this->assertEquals(1000,$payroll->absence_deduction);
        $this->assertEquals(300,$payroll->overtime_amount);
        $this->assertEquals(29300,$payroll->net_salary);
        $this->assertEquals(1,$payroll->absent_days);
    }
}
