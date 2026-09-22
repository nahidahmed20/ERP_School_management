<?php

// Read-only maintenance diagnostic: public CRUD methods for resource routes.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$source = file_get_contents(__DIR__.'/../routes/web.php');
preg_match_all('/^use (App\\\\Http\\\\Controllers\\\\[^;]+);/m', $source, $imports);
$controllers = [];
foreach ($imports[1] as $class) $controllers[substr($class, strrpos($class, '\\') + 1)] = $class;
$resources = [];
foreach (explode("\n", $source) as $line) {
    if (! preg_match('/Route::resource\([^,]+,\s*(\w+)::class\)/', $line, $match)) continue;
    if (str_contains($line, '->only(') || str_contains($line, '->except(')) continue;
    $class = $controllers[$match[1]] ?? null;
    if (! $class || ! class_exists($class)) throw new RuntimeException('Cannot resolve '.$match[1]);
    $methods = array_values(array_filter(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'],
        fn ($method) => method_exists($class, $method) && (new ReflectionMethod($class, $method))->isPublic()));
    if (count($methods) < 7) $resources[] = ['line' => rtrim($line), 'methods' => $methods];
}
echo json_encode($resources, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
