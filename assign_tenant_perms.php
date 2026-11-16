<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$permissions = Spatie\Permission\Models\Permission::pluck('name');
$tenantPerms = $permissions->filter(function($p) {
    // Tenant Admin should NOT have these:
    if (str_contains($p, 'saas-')) return false;
    if (str_contains($p, 'menu.saas')) return false;
    
    // Some security operations might be Super Admin only, but maybe Tenants need them for their own campus?
    // Let's exclude some super admin stuff if it exists.
    if ($p === 'admin.security.operations' || $p === 'admin.security.health') return false;
    
    return true;
})->values()->toArray();

$role = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Tenant Admin']);
$role->syncPermissions($tenantPerms);

echo "Assigned " . count($tenantPerms) . " permissions to Tenant Admin out of " . $permissions->count();
