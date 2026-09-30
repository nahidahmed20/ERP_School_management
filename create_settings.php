<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;

$settings = [
    ['key' => 'register_title', 'value' => 'Modernize Your School ERP', 'label' => 'Registration Title', 'group' => 'registration', 'type' => 'text'],
    ['key' => 'register_subtitle', 'value' => 'Join hundreds of institutes upgrading their management systems. Sign up today and enjoy a fully-featured 1-Month Free Trial to see how we can transform your campus.', 'label' => 'Registration Subtitle', 'group' => 'registration', 'type' => 'textarea'],
    ['key' => 'register_feature_1', 'value' => 'Instant Setup', 'label' => 'Registration Feature 1', 'group' => 'registration', 'type' => 'text'],
    ['key' => 'register_feature_2', 'value' => 'Multi-Campus Ready', 'label' => 'Registration Feature 2', 'group' => 'registration', 'type' => 'text'],
    ['key' => 'register_feature_3', 'value' => 'No Credit Card Required', 'label' => 'Registration Feature 3', 'group' => 'registration', 'type' => 'text'],
];

foreach ($settings as $s) {
    Setting::updateOrCreate(
        ['key' => $s['key'], 'campus_id' => null], // Global setting
        ['value' => $s['value'], 'label' => $s['label'], 'group' => $s['group'], 'type' => $s['type']]
    );
}

\Illuminate\Support\Facades\Artisan::call('cache:clear');
echo "Settings created.";
