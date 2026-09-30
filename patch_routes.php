<?php
$file = "routes/web.php";
$content = file_get_contents($file);

$useStatement = "use App\Http\Controllers\Admin\TenantSubscriptionController;";
if (strpos($content, $useStatement) === false) {
    $content = preg_replace("/use App\\\\Http\\\\Controllers\\\\Admin\\\\DashboardController;/", "use App\\Http\\Controllers\\Admin\\DashboardController;\n" . $useStatement, $content);
}

$routes = "Route::get('/subscription', [TenantSubscriptionController::class, 'index'])->name('subscription.index');\n        Route::post('/subscription/renew', [TenantSubscriptionController::class, 'renew'])->name('subscription.renew');";

if (strpos($content, "subscription.index") === false) {
    // Add inside admin group
    $content = preg_replace("/Route::get\('\/dashboard', \[DashboardController::class, 'index'\]\)\n\s*->name\('dashboard'\);/", "Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');\n        " . $routes, $content);
    file_put_contents($file, $content);
    echo "Added routes";
} else {
    echo "Routes already exist";
}
