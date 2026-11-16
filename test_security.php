<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo \App\Models\SecurityAuditLog::whereHas('user', function($q) { $q->where('id', 1); })->count() . "\n";
    echo \App\Models\SecurityLoginHistory::whereHas('user', function($q) { $q->where('id', 1); })->count() . "\n";
    echo \App\Models\SecurityTrustedDevice::whereHas('user', function($q) { $q->where('id', 1); })->count() . "\n";
    echo "OK\n";
} catch (\Exception $e) {
    echo $e->getMessage() . "\n";
}
