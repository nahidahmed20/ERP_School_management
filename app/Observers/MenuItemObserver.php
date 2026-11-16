<?php

namespace App\Observers;

use App\Models\MenuItem;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;

class MenuItemObserver
{
    public function created(MenuItem $menuItem): void
    {
        $this->ensurePermissionExists($menuItem);
        Cache::forget('sidebar.navigation');
    }

    public function updated(MenuItem $menuItem): void
    {
        $this->ensurePermissionExists($menuItem);
        Cache::forget('sidebar.navigation');
    }

    public function deleted(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function restored(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    public function forceDeleted(MenuItem $menuItem): void
    {
        Cache::forget('sidebar.navigation');
    }

    private function ensurePermissionExists(MenuItem $menuItem): void
    {
        $permission = $menuItem->permission ?: $menuItem->route_name ?: 'menu.'.$menuItem->key;

        if (! $menuItem->permission) {
            $menuItem->updateQuietly(['permission' => $permission]);
        }

        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
}
