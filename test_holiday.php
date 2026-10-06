<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$events = App\Models\Event::whereDate('start_datetime', '<=', today())
    ->whereDate('end_datetime', '>=', today())->get();
echo "Events today: " . $events->count() . "\n";

$policy = App\Models\AttendancePolicy::first();
echo "Policy weekly holidays: " . json_encode($policy->weekly_holidays) . "\n";
echo "Block holiday entry: " . $policy->block_holiday_entry . "\n";
