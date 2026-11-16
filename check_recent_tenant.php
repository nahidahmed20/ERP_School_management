<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::role('Tenant Admin')->latest()->first();
if ($user) {
    echo "Tenant Admin Email: " . $user->email . "\n";
    echo "Created At: " . $user->created_at . "\n";
} else {
    echo "No Tenant Admin found.\n";
}
