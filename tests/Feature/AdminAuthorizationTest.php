<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_without_permission_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.students.index'))
            ->assertForbidden();
    }

    public function test_user_with_matching_permission_can_access_admin_route(): void
    {
        $user = User::factory()->create();
        $permission = Permission::create(['name' => 'admin.students.index', 'guard_name' => 'web']);
        $user->givePermissionTo($permission);

        $this->actingAs($user)
            ->get(route('admin.students.index'))
            ->assertOk();
    }

    public function test_dashboard_requires_its_permission(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertForbidden();

        $user->givePermissionTo(Permission::create([
            'name' => 'dashboard',
            'guard_name' => 'web',
        ]));

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_super_admin_can_access_every_admin_route(): void
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'Super Admin', 'guard_name' => 'web']);
        $user->assignRole($role);

        $this->actingAs($user)
            ->get(route('admin.students.index'))
            ->assertOk();
    }
}
