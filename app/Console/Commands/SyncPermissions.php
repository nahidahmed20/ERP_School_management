<?php

namespace App\Console\Commands;

use App\Services\PermissionSyncService;
use Illuminate\Console\Command;

class SyncPermissions extends Command
{
    protected $signature = 'permissions:sync';

    protected $description = 'Create missing permissions for protected routes and menu items';

    public function handle(PermissionSyncService $syncService): int
    {
        $permissions = $syncService->sync();
        $this->info("Permissions synchronized: {$permissions->count()}");

        return self::SUCCESS;
    }
}
