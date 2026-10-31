<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Services\PermissionSyncService;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = app(PermissionSyncService::class)->sync();

        Campus::firstOrCreate(
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

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $teacherRole = Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
        $teacherRole->syncPermissions(['dashboard', 'admin.students.index']);

        $hrRole = Role::firstOrCreate(['name' => 'HR', 'guard_name' => 'web']);
        $hrPermissions = [
            'dashboard',
            'admin.departments.index',
            'admin.departments.create',
            'admin.departments.store',
            'admin.departments.show',
            'admin.departments.edit',
            'admin.departments.update',
            'admin.departments.destroy',
            'admin.designations.index',
            'admin.designations.create',
            'admin.designations.store',
            'admin.designations.show',
            'admin.designations.edit',
            'admin.designations.update',
            'admin.designations.destroy',
            'admin.leave-types.index',
            'admin.leave-types.create',
            'admin.leave-types.store',
            'admin.leave-types.show',
            'admin.leave-types.edit',
            'admin.leave-types.update',
            'admin.leave-types.destroy',
            'admin.staff.index',
            'admin.staff.create',
            'admin.staff.store',
            'admin.staff.show',
            'admin.staff.edit',
            'admin.staff.update',
            'admin.staff.destroy',
            'admin.staff.id-card',
            'admin.staff-attendance.index',
            'admin.staff-attendance.store',
            'admin.staff-leaves.index',
            'admin.staff-leaves.create',
            'admin.staff-leaves.store',
            'admin.staff-leaves.show',
            'admin.staff-leaves.edit',
            'admin.staff-leaves.update',
            'admin.staff-leaves.destroy',
            'admin.staff-appraisals.index',
            'admin.staff-appraisals.store',
            'admin.staff-appraisals.update',
            'admin.staff-appraisals.destroy',
            'admin.staff-hr-records.index',
            'admin.staff-hr-records.store',
            'admin.staff-hr-records.update',
            'admin.staff-hr-records.destroy',
        ];
        $hrRole->syncPermissions($permissions->intersect($hrPermissions));

        $payrollPermissions = [
            'admin.staff-payrolls.index',
            'admin.staff-payrolls.show',
            'admin.staff-payrolls.generate',
            'admin.staff-payrolls.attendance',
            'admin.staff-payrolls.attendance.update',
        ];

        $payrollOfficer = Role::firstOrCreate(['name' => 'Payroll Officer', 'guard_name' => 'web']);
        $payrollOfficer->syncPermissions($permissions->intersect(array_merge(['dashboard'], $payrollPermissions)));

        $hrManager = Role::firstOrCreate(['name' => 'HR Manager', 'guard_name' => 'web']);
        $hrManager->syncPermissions($permissions->intersect(array_merge(
            $hrPermissions,
            $payrollPermissions,
            [
                'admin.staff-payrolls.create',
                'admin.staff-payrolls.store',
                'admin.staff-payrolls.edit',
                'admin.staff-payrolls.update',
                'admin.staff-payrolls.destroy',
                'admin.staff-payrolls.approve',
                'admin.staff-payrolls.finalize',
                'admin.staff-payrolls.bank-sheet',
            ]
        )));

        $accountantRole = Role::firstOrCreate(['name' => 'Accountant', 'guard_name' => 'web']);
        $accountantPermissions = $permissions->filter(fn (string $permission) =>
            $permission === 'dashboard'
            || str_starts_with($permission, 'admin.accounting.')
            || str_starts_with($permission, 'admin.fees.')
            || str_starts_with($permission, 'admin.fees-groups.')
            || str_starts_with($permission, 'admin.fees-types.')
            || str_starts_with($permission, 'admin.studentfees.')
            || str_starts_with($permission, 'admin.payments.transactions.')
            || str_starts_with($permission, 'admin.payments.refunds.')
            || $permission === 'admin.reports.financial-summary'
        );
        $accountantRole->syncPermissions($accountantPermissions);

        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
        $parentRole = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $studentRole->givePermissionTo(['dashboard', 'portal.services.view', 'portal.exams.attempt']);
        $parentRole->givePermissionTo('dashboard');

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
