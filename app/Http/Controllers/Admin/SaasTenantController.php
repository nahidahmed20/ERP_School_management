<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasTenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasTenantController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasTenant::query();

        if ($search = $request->get('search')) {
            $query->where('company_name', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%")
                  ->orWhere('admin_email', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $tenants = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $tenants = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'domain' => 'required|string|unique:saas_tenants,domain',
            'admin_email' => 'required|email',
            'admin_phone' => 'nullable|string',
            'subscription_plan' => 'required|string',
            'status' => 'required|string',
            'valid_until' => 'nullable|date',
        ]);

        SaasTenant::create($validated);
        return back()->with('success', 'New Tenant (Client) onboarded successfully.');
    }

    public function update(Request $request, $id)
    {
        $tenant = SaasTenant::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'domain' => 'required|string|unique:saas_tenants,domain,'.$id,
            'admin_email' => 'required|email',
            'admin_phone' => 'nullable|string',
            'subscription_plan' => 'required|string',
            'status' => 'required|string',
            'valid_until' => 'nullable|date',
        ]);

        $tenant->update($validated);
        return back()->with('success', 'Tenant billing details updated.');
    }

    public function destroy($id)
    {
        SaasTenant::findOrFail($id)->delete();
        return back()->with('success', 'Tenant removed successfully.');
    }
}
