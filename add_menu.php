<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

if (!MenuItem::where('route_name', 'admin.subscription.index')->exists()) {
    MenuItem::create([
        'menu_group_id' => 1, // System or default
        'label' => 'My Subscription',
        'key' => 'my-subscription',
        'icon' => 'FaCreditCard',
        'route_name' => 'admin.subscription.index',
        'parent_id' => null,
        'order' => 999, // Put at the bottom
        'is_active' => true,
        'permission' => 'admin.subscription.index',
    ]);
    echo "Menu created.";
} else {
    echo "Menu already exists.";
}

\Illuminate\Support\Facades\Artisan::call('cache:clear');
