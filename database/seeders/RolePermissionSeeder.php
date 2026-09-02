<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\User;
use App\Services\PermissionSyncService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = app(PermissionSyncService::class)->sync();

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
        $teacherRole->syncPermissions(['dashboard', 'admin.students.index']);

        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
        $parentRole = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $studentRole->givePermissionTo(['dashboard', 'portal.services.view', 'portal.exams.attempt']);
        $parentRole->givePermissionTo('dashboard');

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
