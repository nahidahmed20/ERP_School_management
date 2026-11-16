<?php

namespace Tests\Feature;

use App\Models\Campus;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StaffLoginAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_unlinked_staff_can_be_given_a_login_account_from_edit(): void
    {
        [$admin, $campus, $staff] = $this->staffSetup();
        $role = Role::create(['name' => 'teacher', 'guard_name' => 'web']);

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->get(route('admin.staff.edit', $staff))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Staff/Edit')
                ->where('staff.user_id', null)
                ->has('roles'));

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->put(route('admin.staff.update', $staff), $this->staffData($staff) + [
                'create_user_account' => true,
                'role_name' => $role->name,
            ])
            ->assertRedirect(route('admin.staff.index'))
            ->assertSessionHasNoErrors();

        $staff->refresh();
        $this->assertNotNull($staff->user_id);
        $this->assertSame($campus->id, (int) $staff->user->campus_id);
        $this->assertSame(strtolower($staff->staff_id_no).'@school.com', $staff->user->email);
        $this->assertTrue(Hash::check($staff->staff_id_no, $staff->user->password));
        $this->assertTrue($staff->user->hasRole($role));
    }

    public function test_edit_keeps_staff_without_login_account_when_option_is_not_selected(): void
    {
        [$admin, $campus, $staff] = $this->staffSetup();

        $this->actingAs($admin)->withSession(['active_campus_id' => $campus->id])
            ->put(route('admin.staff.update', $staff), $this->staffData($staff) + [
                'create_user_account' => false,
            ])
            ->assertRedirect(route('admin.staff.index'))
            ->assertSessionHasNoErrors();

        $this->assertNull($staff->fresh()->user_id);
        $this->assertDatabaseCount('users', 1);
    }

    private function staffSetup(): array
    {
        config(['app.active_campus_id' => null]);
        $campus = Campus::create(['name' => 'Test Campus', 'code' => 'TEST', 'is_active' => true]);
        $admin = User::factory()->create(['campus_id' => null]);
        $admin->assignRole(Role::create(['name' => 'Super Admin', 'guard_name' => 'web']));
        $department = Department::create(['campus_id' => $campus->id, 'name' => 'Academic']);
        $designation = Designation::create(['campus_id' => $campus->id, 'name' => 'Teacher']);
        $staff = Staff::create([
            'campus_id' => $campus->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
            'staff_id_no' => 'EMP-TEST-0001',
            'first_name' => 'Test',
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'joining_date' => '2026-01-01',
            'phone' => '01700000001',
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
            'basic_salary' => 10000,
        ]);

        return [$admin, $campus, $staff];
    }

    private function staffData(Staff $staff): array
    {
        return [
            'department_id' => $staff->department_id,
            'designation_id' => $staff->designation_id,
            'first_name' => $staff->first_name,
            'last_name' => $staff->last_name,
            'gender' => $staff->gender,
            'date_of_birth' => $staff->date_of_birth,
            'joining_date' => $staff->joining_date,
            'phone' => $staff->phone,
            'email' => $staff->email,
            'present_address' => $staff->present_address,
            'permanent_address' => $staff->permanent_address,
            'basic_salary' => $staff->basic_salary,
            'is_active' => true,
        ];
    }
}
