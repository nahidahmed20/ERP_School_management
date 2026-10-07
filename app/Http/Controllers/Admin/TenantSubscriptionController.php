<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SaasTenant;

class TenantSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = null;

        // Find tenant by user's campus
        if ($user && $user->campus_id) {
            $campus = \App\Models\Campus::find($user->campus_id);
            if ($campus && $campus->saas_tenant_id) {
                $tenant = SaasTenant::find($campus->saas_tenant_id);
            }
        }

        if (!$tenant && $user->hasRole('Super Admin')) {
            // Fallback for Super Admin
            $tenant = SaasTenant::first();
        } elseif (!$tenant) {
            abort(403, 'No active subscription found for this campus.');
        }

        return Inertia::render('Admin/Subscription/Index', [
            'tenant' => $tenant ? $tenant->company_name : 'N/A',
            'plan' => $tenant ? $tenant->subscription_plan : 'N/A',
            'valid_until' => $tenant && $tenant->valid_until ? $tenant->valid_until->format('Y-m-d') : 'N/A',
            'is_expired' => $tenant && $tenant->valid_until ? $tenant->valid_until->isPast() : true,
            'invoices' => [],
        ]);
    }

    public function renew(Request $request)
    {
        $user = $request->user();
        if ($user && $user->campus_id) {
            $campus = \App\Models\Campus::find($user->campus_id);
            if ($campus && $campus->saas_tenant_id) {
                $tenant = SaasTenant::find($campus->saas_tenant_id);
                if ($tenant) {
                    // Mock payment: add 1 month
                    $tenant->valid_until = $tenant->valid_until && $tenant->valid_until->isFuture()
                        ? $tenant->valid_until->addMonth()
                        : now()->addMonth();
                    $tenant->subscription_plan = 'Premium';
                    $tenant->save();
                }
            }
        }
        return back()->with('success', 'Subscription renewed successfully!');
    }
}
