<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$role = Spatie\Permission\Models\Role::where('name', 'Tenant Admin')->first();
if ($role) {
    echo json_encode($role->permissions->pluck('name'));
} else {
    echo "No Tenant Admin role";
}
