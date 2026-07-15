<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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

        $mainCampus = Campus::firstOrCreate(
            ['code' => 'MAIN'],
            [
                'name' => 'Main Campus',
                'phone' => '01700000000',
                'email' => 'info@school.com',
                'address' => 'Dhaka, Bangladesh',
                'established_year' => 2025,
                'is_main' => true,
                'is_active' => true,
                'order' => 1,
            ]
        );

        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $teacherRole = Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
        $teacherRole->syncPermissions(['admin.dashboard', 'admin.students.index']);

        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('11111111'),
                'campus_id' => 1,
            ]
        );

        $superAdminUser->assignRole($superAdminRole);

        $teacherUser = User::firstOrCreate(
            ['email' => 'teacher@school.com'],
            [
                'name' => 'Teacher',
                'password' => Hash::make('password'),
                'campus_id' => $mainCampus->id,
            ]
        );
        $teacherUser->assignRole($teacherRole);

        $this->command->info('Roles, Permissions, and Users seeded successfully!');
    }
}
