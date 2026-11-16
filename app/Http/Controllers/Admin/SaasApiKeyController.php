<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{SaasApiKey, SaasTenant};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SaasApiKeyController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasApiKey::with('tenant:id,company_name,domain');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('api_key', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $keys = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $keys = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/ApiKeys/Index', [
            'apiKeys' => $keys,
            'tenants' => SaasTenant::select('id', 'company_name')->get(),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tenant_id' => 'nullable|exists:saas_tenants,id',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $validated['api_key'] = 'erp_live_' . Str::random(40);

        SaasApiKey::create($validated);
        return back()->with('success', 'New API Key generated successfully.');
    }

    public function update(Request $request, $id)
    {
        $apiKey = SaasApiKey::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tenant_id' => 'nullable|exists:saas_tenants,id',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $apiKey->update($validated);
        return back()->with('success', 'API Key updated successfully.');
    }

    public function destroy($id)
    {
        SaasApiKey::findOrFail($id)->delete();
        return back()->with('success', 'API Key deleted and access revoked.');
    }
}
