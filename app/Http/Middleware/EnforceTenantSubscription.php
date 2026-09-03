<?php

namespace App\Http\Middleware;

use App\Models\Campus;
use App\Models\Student;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || $user->hasRole('Super Admin')) {
            return $next($request);
        }

        $tenant = Campus::withoutGlobalScopes()->with('tenant.plan')->find($user->campus_id)?->tenant;
        if (! $tenant) {
            return $next($request);
        }

        abort_if(strtolower($tenant->status) !== 'active' || $tenant->suspended_at, 423, 'Tenant subscription is suspended.');
        abort_if($tenant->valid_until && $tenant->valid_until->isPast(), 402, 'Tenant subscription has expired.');

        if ($plan = $tenant->plan) {
            $feature = $this->feature($request->route()?->getName());
            $limits = $plan->feature_limits ?? [];

            if ($feature && array_key_exists($feature, $limits) && ! filter_var($limits[$feature], FILTER_VALIDATE_BOOLEAN)) {
                abort(403, "{$feature} is not included in this plan.");
            }

            if ($request->routeIs('admin.students.store')) {
                $campuses = $tenant->campuses()->pluck('id');
                abort_if(Student::withoutGlobalScopes()->whereIn('campus_id', $campuses)->count() >= $plan->max_students, 422, 'Tenant student limit reached.');
            }

            if ($request->routeIs('admin.campuses.store')) {
                abort_if($tenant->campuses()->count() >= $plan->max_campuses, 422, 'Tenant campus limit reached.');
            }

            $incomingMb = $this->uploadedMegabytes($request->allFiles());
            if ($incomingMb > 0 && $plan->storage_limit_mb) {
                $usedMb = (float) DB::table('tenant_usage_metrics')
                    ->where('saas_tenant_id', $tenant->id)
                    ->where('metric', 'storage_mb')
                    ->latest('metric_date')
                    ->value('value');
                abort_if($usedMb + $incomingMb > $plan->storage_limit_mb, 422, 'Tenant storage limit reached.');
            }
        }

        return $next($request);
    }

    private function feature(?string $route): ?string
    {
        $features = [
            'transport' => ['transport'],
            'hostel' => ['hostel'],
            'library' => ['library'],
            'cafeteria' => ['cafeteria'],
            'medical' => ['medical'],
            'communication' => ['communication'],
            'reports' => ['reports', 'reporting'],
        ];

        foreach ($features as $feature => $needles) {
            foreach ($needles as $needle) {
                if (str_contains((string) $route, $needle)) {
                    return $feature;
                }
            }
        }

        return null;
    }

    private function uploadedMegabytes(array $files): float
    {
        $bytes = 0;
        array_walk_recursive($files, function ($file) use (&$bytes): void {
            if (is_object($file) && method_exists($file, 'getSize')) {
                $bytes += (int) $file->getSize();
            }
        });

        return $bytes / 1024 / 1024;
    }
}
