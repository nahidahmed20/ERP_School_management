<?php

namespace Tests\Feature;

use App\Models\{Applicant, Campus, JobPost, SaasBackup, User};
use App\Services\SecureBackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SecurityAndOperationsHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_recruitment_records_are_isolated_by_active_campus(): void
    {
        $a=Campus::create(['name'=>'Campus A','code'=>'A']);$b=Campus::create(['name'=>'Campus B','code'=>'B']);
        config(['app.active_campus_id'=>$a->id]);$jobA=JobPost::create(['title'=>'Teacher A','employment_type'=>'Full Time','deadline'=>today()->addMonth(),'status'=>'Open']);Applicant::create(['job_post_id'=>$jobA->id,'name'=>'Applicant A','phone'=>'1','applied_date'=>today(),'status'=>'Pending']);
        config(['app.active_campus_id'=>$b->id]);$jobB=JobPost::create(['title'=>'Teacher B','employment_type'=>'Full Time','deadline'=>today()->addMonth(),'status'=>'Open']);Applicant::create(['job_post_id'=>$jobB->id,'name'=>'Applicant B','phone'=>'2','applied_date'=>today(),'status'=>'Pending']);
        $this->assertSame(['Applicant B'],Applicant::pluck('name')->all());config(['app.active_campus_id'=>$a->id]);$this->assertSame(['Applicant A'],Applicant::pluck('name')->all());
    }

    public function test_secure_file_route_cannot_download_another_campus_resume(): void
    {
        $a=Campus::create(['name'=>'Campus A','code'=>'A']);$b=Campus::create(['name'=>'Campus B','code'=>'B']);$user=User::factory()->create(['campus_id'=>$a->id]);$user->givePermissionTo(Permission::create(['name'=>'admin.secure-files.applicant-resume','guard_name'=>'web']));
        config(['app.active_campus_id'=>$b->id]);$job=JobPost::create(['title'=>'Remote','employment_type'=>'Full Time','deadline'=>today()->addMonth(),'status'=>'Open']);$applicant=Applicant::create(['job_post_id'=>$job->id,'name'=>'Remote','phone'=>'2','resume'=>'recruitment/resumes/'.$b->id.'/resume.pdf','applied_date'=>today(),'status'=>'Pending']);Storage::disk('local')->put($applicant->resume,'private');
        $this->actingAs($user)->get(route('admin.secure-files.applicant-resume',$applicant->id))->assertNotFound();
    }

    public function test_backup_is_encrypted_checksummed_and_verifiable(): void
    {
        Storage::fake('backup');config(['erp.backup_disk'=>'backup']);$backup=SaasBackup::create(['file_name'=>'test.zip','type'=>'Database','status'=>'Pending']);
        app(SecureBackupService::class)->create($backup);$backup->refresh();
        $this->assertSame('Completed',$backup->status);$this->assertTrue($backup->encrypted);$this->assertNotEmpty($backup->checksum);$this->assertTrue(app(SecureBackupService::class)->verify($backup));
    }
}
