<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = Illuminate\Support\Facades\Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
echo "Tables: " . implode(', ', array_filter($tables, fn($t) => in_array($t, ['users', 'tenants', 'campuses', 'organizations']))) . "\n";
