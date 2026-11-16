<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$policy = App\Models\AttendancePolicy::where('is_active', true)->first();
if ($policy) {
    // 5 = Friday, 6 = Saturday (Standard Bangladesh Weekend)
    $policy->weekly_holidays = [5]; // Only Friday, or [5, 6] for Fri+Sat? Most BD schools have Friday. Let's do [5] or [5, 6]. Let's just do Friday (5) since some have Saturday on.
    $policy->save();
    echo "Updated weekly holidays to Friday.\n";
}
