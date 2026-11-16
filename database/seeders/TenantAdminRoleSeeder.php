<?php

namespace Database\Seeders;

use App\Services\PermissionSyncService;
use Illuminate\Database\Seeder;

class TenantAdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionSyncService::class)->syncTenantAdminRole();
    }
}
