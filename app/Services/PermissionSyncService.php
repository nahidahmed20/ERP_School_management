<?php

namespace App\Services;

use App\Models\MenuItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
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

        $branchAdmin = Role::firstOrCreate(['name' => 'Branch Admin', 'guard_name' => 'web']);
        $centralOnly = ['admin.campus.', 'admin.campuses.', 'admin.saas', 'admin.roles.', 'admin.permissions.', 'admin.menu.', 'admin.menu-groups.', 'admin.security', 'admin.registry.', 'admin.translations.', 'admin.general.website.update'];
        $branchPermissions = $permissions->filter(fn (string $name) => $name === 'dashboard' || (
            str_starts_with($name, 'admin.') && ! collect($centralOnly)->contains(fn ($prefix) => str_starts_with($name, $prefix))
        ));
        $branchAdmin->syncPermissions($branchPermissions);

        // Tenant Admin manages their own tenant across its campuses, while
        // central SaaS, role, permission, and security controls stay Super-Admin-only.
        $this->syncTenantAdminRole($permissions);

        return $permissions;
    }

    public function syncTenantAdminRole(?Collection $permissions = null): void
    {
        $permissions ??= collect(Route::getRoutes())
            ->map(fn ($route) => $route->getName())
            ->filter(fn ($name) => is_string($name) && str_starts_with($name, 'admin.'))
            ->merge(MenuItem::query()->get(['key', 'route_name', 'permission'])->map(
                fn (MenuItem $item) => $item->permission ?: $item->route_name ?: 'menu.'.$item->key
            ))
            ->merge(['dashboard', 'portal.results.view', 'portal.services.view', 'portal.exams.attempt'])
            ->filter()->unique()->values();

        $permissions->each(fn (string $name) => Permission::firstOrCreate([
            'name' => $name,
            'guard_name' => 'web',
        ]));

        $centralOnly = ['admin.campus.', 'admin.campuses.', 'admin.saas', 'admin.roles.', 'admin.permissions.', 'admin.menu.', 'admin.menu-groups.', 'admin.security', 'admin.registry.', 'admin.translations.', 'admin.general.website.update'];
        $branchPermissions = $permissions->filter(fn (string $name) => $name === 'dashboard' || (
            str_starts_with($name, 'admin.') && ! collect($centralOnly)->contains(fn ($prefix) => str_starts_with($name, $prefix))
        ));
        $tenantPermissions = $branchPermissions->merge($permissions->filter(fn (string $name) =>
            str_starts_with($name, 'admin.campuses.') || $name === 'admin.campus.switch'
        ))->unique()->values();

        Role::firstOrCreate(['name' => 'Tenant Admin', 'guard_name' => 'web'])
            ->syncPermissions($tenantPermissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
