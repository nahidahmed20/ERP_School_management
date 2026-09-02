<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class StudentPortalPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $permissions = collect(['dashboard', 'portal.services.view', 'portal.exams.attempt'])
            ->map(fn ($name) => Permission::firstOrCreate(['name'=>$name, 'guard_name'=>'web']));
        $role = Role::whereRaw('LOWER(name) = ?', ['student'])->first();
        if ($role) $role->givePermissionTo($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
