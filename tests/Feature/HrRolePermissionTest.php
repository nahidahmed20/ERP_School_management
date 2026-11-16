<?php

namespace Tests\Feature;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HrRolePermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_hr_role_gets_hr_permissions_without_payroll_or_administrator_access(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $hrRole = Role::findByName('HR', 'web');
        $permissions = $hrRole->permissions->pluck('name')->all();

        $this->assertContains('admin.staff.index', $permissions);
        $this->assertContains('admin.staff.update', $permissions);
        $this->assertContains('admin.staff-attendance.store', $permissions);
        $this->assertContains('admin.staff-leaves.update', $permissions);
        $this->assertContains('admin.staff-hr-records.index', $permissions);
        $this->assertNotContains('admin.staff-payrolls.index', $permissions);
        $this->assertNotContains('admin.staff-loans.index', $permissions);
        $this->assertNotContains('admin.users.index', $permissions);
        $this->assertNotContains('admin.roles.index', $permissions);
    }
}
