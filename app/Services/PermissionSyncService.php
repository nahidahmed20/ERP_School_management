<?php

namespace App\Services;

use App\Models\MenuItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSyncService
{
    public function sync(): Collection
    {
        $routePermissions = collect(Route::getRoutes())
            ->map(fn ($route) => $route->getName())
            ->filter(fn ($name) => is_string($name) && str_starts_with($name, 'admin.'));

        $menuPermissions = MenuItem::query()->get(['id', 'key', 'route_name', 'permission'])
            ->map(function (MenuItem $item) {
                $permission = $item->permission ?: $item->route_name ?: 'menu.'.$item->key;

                if (! $item->permission) {
                    $item->updateQuietly(['permission' => $permission]);
                }

                return $permission;
            });

        $permissions = $routePermissions->merge($menuPermissions)->merge([
            'dashboard', 'portal.results.view', 'portal.services.view', 'portal.exams.attempt'
        ])
            ->filter()->unique()->values();

        $permissions->each(fn (string $name) => Permission::firstOrCreate([
            'name' => $name,
            'guard_name' => 'web',
        ]));

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $permissions;
    }
}
