<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = App\Models\MenuItem::where('route_name', 'like', '%saas%')->get();
echo json_encode($items->map(fn($i) => ['name' => $i->title, 'route' => $i->route_name]));
