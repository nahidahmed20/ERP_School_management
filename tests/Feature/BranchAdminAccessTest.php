<?php

namespace Tests\Feature;

use App\Models\{Campus, User, Vendor};
use App\Services\PermissionSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BranchAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_branch_admin_logs_in_through_admin_portal_and_is_fixed_to_own_campus(): void
    {
        $a=Campus::create(['name'=>'Branch A','code'=>'BA','is_main'=>true]);$b=Campus::create(['name'=>'Branch B','code'=>'BB']);
        app(PermissionSyncService::class)->sync();
        $admin=User::factory()->create(['campus_id'=>$a->id,'password'=>Hash::make('password')]);$admin->assignRole('Branch Admin');
        config(['app.active_campus_id'=>$b->id]);Vendor::create(['name'=>'Other Branch Vendor','phone'=>'1','is_active'=>true]);config(['app.active_campus_id'=>null]);

        $this->post('/login',['login'=>$admin->email,'password'=>'password','role'=>'admin'])->assertRedirect(route('dashboard',absolute:false));
        $this->assertAuthenticatedAs($admin);
        $this->actingAs($admin)->post(route('admin.campus.switch'),['campus_id'=>$b->id])->assertForbidden();
        $this->actingAs($admin)->get(route('admin.purchase.vendors.index'))->assertOk()->assertDontSee('Other Branch Vendor');
    }

    public function test_branch_admin_has_operational_permissions_but_not_central_control(): void
    {
        $campus=Campus::create(['name'=>'Branch A','code'=>'BA','is_main'=>true]);app(PermissionSyncService::class)->sync();$admin=User::factory()->create(['campus_id'=>$campus->id]);$admin->assignRole('Branch Admin');
        $this->assertTrue($admin->can('admin.students.index'));
        $this->assertTrue($admin->can('admin.purchase.vendors.index'));
        $this->assertFalse($admin->can('admin.campuses.index'));
        $this->assertFalse($admin->can('admin.saas.control'));
    }
}
