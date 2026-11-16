<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "SecurityAuditLog user_id: " . (\Illuminate\Support\Facades\Schema::hasColumn('security_audit_logs', 'user_id') ? "yes" : "no") . "\n";
echo "SecurityLoginHistory user_id: " . (\Illuminate\Support\Facades\Schema::hasColumn('security_login_histories', 'user_id') ? "yes" : "no") . "\n";
echo "SecurityTrustedDevice user_id: " . (\Illuminate\Support\Facades\Schema::hasColumn('security_trusted_devices', 'user_id') ? "yes" : "no") . "\n";
