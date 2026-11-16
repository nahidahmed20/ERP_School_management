<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AssignPermissionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-permissions-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    public function handle()
    {
        $this->info("Syncing roles...");

        // 1. Admin (Tenant Admin)
        $tenantAdmin = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Tenant Admin']);
        $tenantPermissions = \Spatie\Permission\Models\Permission::where('name', '!=', 'admin.saas.index')
            ->where('name', 'not like', 'admin.saas.%')
            ->where('name', 'not like', 'admin.campuses.%')
            ->where('name', 'not like', 'admin.roles.%')
            ->where('name', 'not like', 'admin.permissions.%')
            ->pluck('name')->toArray();
        $tenantAdmin->syncPermissions($tenantPermissions);
        $this->info("Assigned " . count($tenantPermissions) . " permissions to Tenant Admin.");

        // 2. Super Admin
        $superAdmin = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdmin->syncPermissions(\Spatie\Permission\Models\Permission::pluck('name')->toArray());
        $this->info("Assigned " . \Spatie\Permission\Models\Permission::count() . " permissions to Super Admin.");

        // 3. Teacher
        $teacher = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Teacher']);
        $teacherPermissions = \Spatie\Permission\Models\Permission::where(function($q) {
            $q->where('name', 'like', 'admin.academic-operations.%')
              ->orWhere('name', 'like', 'admin.time-tables.%')
              ->orWhere('name', 'like', 'admin.lesson-plans.%')
              ->orWhere('name', 'like', 'admin.lms.%')
              ->orWhere('name', 'like', 'admin.homework.%')
              ->orWhere('name', 'like', 'admin.exams.%')
              ->orWhere('name', 'like', 'admin.student-attendance.%')
              ->orWhere('name', 'like', 'admin.students.index')
              ->orWhere('name', 'like', 'admin.students.show')
              ->orWhere('name', 'like', 'admin.study-materials.%')
              ->orWhere('name', 'dashboard')
              ->orWhere('name', 'admin.dashboard')
              ->orWhere('name', 'portal.services.view')
              ->orWhere('name', 'menu.classes')
              ->orWhere('name', 'menu.students')
              ->orWhere('name', 'menu.exams')
              ->orWhere('name', 'menu.attendance')
              ->orWhere('name', 'menu.lms')
              ->orWhere('name', 'menu.documents');
        })->pluck('name')->toArray();
        $teacher->syncPermissions($teacherPermissions);
        $this->info("Assigned " . count($teacherPermissions) . " permissions to Teacher.");

        // 4. Student
        $student = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Student']);
        $studentPermissions = \Spatie\Permission\Models\Permission::whereIn('name', [
            'dashboard',
            'portal.services.view',
            'portal.results.view',
            'portal.exams.attempt',
        ])->pluck('name')->toArray();
        $student->syncPermissions($studentPermissions);
        $this->info("Assigned " . count($studentPermissions) . " permissions to Student.");

        // 5. Parent
        $parent = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Parent']);
        $parentPermissions = \Spatie\Permission\Models\Permission::whereIn('name', [
            'dashboard',
            'portal.services.view',
            'portal.results.view',
        ])->pluck('name')->toArray();
        $parent->syncPermissions($parentPermissions);
        $this->info("Assigned " . count($parentPermissions) . " permissions to Parent.");

        $this->info("Done!");
    }
}
