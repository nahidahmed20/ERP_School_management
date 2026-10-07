$file = "routes/web.php"
$content = Get-Content $file -Raw
$new_routes = "    Route::get('subscription', [TenantSubscriptionController::class, 'index'])->name('subscription.index');`n    Route::post('subscription/renew', [TenantSubscriptionController::class, 'renew'])->name('subscription.renew');`n"
$content = $content -replace "(Route::resource\('saas-queue', SaasQueueMonitorController::class\)->names\('saas\.queue'\)->only\(\['index', 'destroy'\]\);)", "`$1`n`n$new_routes"
Set-Content $file $content -Encoding UTF8
