<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasPlanController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasPlan::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $plans = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $plans = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/Plans/Index', [
            'plans' => $plans,
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
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'billing_cycle' => 'required|string',
            'features' => 'nullable|string', 
            'is_active' => 'boolean',
        ]);

        $featuresArray = array_filter(array_map('trim', explode("\n", $validated['features'] ?? '')));
        $validated['features'] = $featuresArray;

        SaasPlan::create($validated);
        return back()->with('success', 'Subscription Plan created successfully.');
    }

    public function update(Request $request, $id)
    {
        $plan = SaasPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'billing_cycle' => 'required|string',
            'features' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $featuresArray = array_filter(array_map('trim', explode("\n", $validated['features'] ?? '')));
        $validated['features'] = $featuresArray;

        $plan->update($validated);
        return back()->with('success', 'Subscription Plan updated successfully.');
    }

    public function destroy($id)
    {
        SaasPlan::findOrFail($id)->delete();
        return back()->with('success', 'Subscription Plan deleted.');
    }
}
