<?php

use App\Http\Middleware\EnsureAdminAccess;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetActiveCampus;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\PermissionMiddleware;
use App\Http\Middleware\EnforcePasswordExpiry;
use App\Http\Middleware\EnforceTenantSubscription;
use Illuminate\Support\Facades\{DB,Schema};

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.access' => EnsureAdminAccess::class,
            'permission' => PermissionMiddleware::class,
        ]);

        $middleware->web(append: [
            SetActiveCampus::class,
            EnforceTenantSubscription::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnforcePasswordExpiry::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'payments/sslcommerz/success',
            'payments/sslcommerz/fail',
            'payments/sslcommerz/cancel',
            'payments/sslcommerz/ipn',
            'webhooks/communications/*',
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (Throwable $e) {
            try { if (Schema::hasTable('system_error_events')) DB::table('system_error_events')->insert(['level'=>'error','fingerprint'=>hash('sha256',get_class($e).'|'.$e->getMessage().'|'.$e->getFile().'|'.$e->getLine()),'message'=>$e->getMessage(),'location'=>$e->getFile().':'.$e->getLine(),'context'=>json_encode(['exception'=>get_class($e)]),'occurred_at'=>now(),'created_at'=>now(),'updated_at'=>now()]); } catch (Throwable) {}
        });
    })->create();
