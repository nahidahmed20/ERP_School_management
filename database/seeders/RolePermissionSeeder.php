<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'admin.dashboard',
            'admin.users.index',
            'admin.roles.index',
            'admin.permissions.index',
            'admin.menu.index',
            'admin.settings.general',
            'admin.students.index',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $teacherRole = Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
        $teacherRole->syncPermissions(['admin.dashboard', 'admin.students.index']);

        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('11111111'),
            ]
        );

        $superAdminUser->assignRole($superAdminRole);

        $teacherUser = User::firstOrCreate(
            ['email' => 'teacher@school.com'],
            [
                'name' => 'Teacher',
                'password' => Hash::make('password'),
            ]
        );
        $teacherUser->assignRole($teacherRole);

        $this->command->info('Roles, Permissions, and Users seeded successfully!');
    }
}
