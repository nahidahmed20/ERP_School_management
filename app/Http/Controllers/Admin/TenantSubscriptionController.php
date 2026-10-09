<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                $tenant = SaasTenant::with('plan')->find($campus->saas_tenant_id);
            }
        }

        if (!$tenant && $user->hasRole('Super Admin')) {
            // Fallback for Super Admin accessing directly
            $tenant = SaasTenant::with('plan')->first();
        } elseif (!$tenant) {
            abort(403, 'No active subscription found for this campus.');
        }

        $invoices = DB::table('tenant_billing_invoices')
            ->where('saas_tenant_id', $tenant->id)
            ->latest()
            ->take(20)
            ->get();
            
        $usage = DB::table('tenant_usage_metrics')
            ->where('saas_tenant_id', $tenant->id)
            ->latest('metric_date')
            ->first();

        return Inertia::render('Admin/Subscription/Index', [
            'tenant' => $tenant->company_name ?? 'N/A',
            'domain' => $tenant->domain ?? 'N/A',
            'plan' => $tenant->plan,
            'usage' => $usage,
            'valid_until' => $tenant->valid_until ? $tenant->valid_until->format('Y-m-d') : null,
            'is_expired' => $tenant->valid_until ? $tenant->valid_until->isPast() : true,
            'invoices' => $invoices,
        ]);
    }

    public function renew(Request $request)
    {
        $user = $request->user();
        $tenant = null;
        
        if ($user && $user->campus_id) {
            $campus = \App\Models\Campus::find($user->campus_id);
            if ($campus && $campus->saas_tenant_id) {
                $tenant = SaasTenant::with('plan')->find($campus->saas_tenant_id);
            }
        }
        
        if (!$tenant) {
            return back()->with('error', 'Unable to process renewal.');
        }

        // Mock payment: Generate a new paid invoice and extend validity
        $plan = $tenant->plan;
        $amount = $plan ? $plan->price : 0;
        
        DB::transaction(function () use ($tenant, $amount, $plan) {
            DB::table('tenant_billing_invoices')->insert([
                'saas_tenant_id' => $tenant->id,
                'invoice_no' => 'SAAS-' . now()->format('ymd') . '-' . $tenant->id . '-' . random_int(100, 999),
                'period_start' => now(),
                'period_end' => now()->addMonth(),
                'due_date' => now(),
                'amount' => $amount,
                'currency' => $plan ? $plan->currency : 'BDT',
                'status' => 'paid',
                'paid_at' => now(),
                'payment_reference' => 'MOCK-' . strtoupper(uniqid()),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $tenant->valid_until = $tenant->valid_until && $tenant->valid_until->isFuture()
                ? $tenant->valid_until->addMonth()
                : now()->addMonth();
            $tenant->save();
        });

        return back()->with('success', 'Subscription successfully renewed for 1 month!');
    }
}
