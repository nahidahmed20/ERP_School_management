<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportRouteController extends Controller
{
    public function index(Request $request)
    {
        $query = TransportRoute::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('start_point', 'like', "%{$search}%")
                  ->orWhere('end_point', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $routes = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $routes = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/CampusTransport/Routes/Index', [
            'routes' => $routes,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_point' => 'nullable|string|max:255',
            'end_point' => 'nullable|string|max:255',
            'base_fare' => 'required|numeric|min:0',
            'stops' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $stopsArray = array_filter(array_map('trim', explode("\n", $validated['stops'] ?? '')));
        $validated['stops'] = $stopsArray;

        TransportRoute::create($validated);
        return back()->with('success', 'Transport Route created successfully.');
    }

    public function update(Request $request, $id)
    {
        $route = TransportRoute::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_point' => 'nullable|string|max:255',
            'end_point' => 'nullable|string|max:255',
            'base_fare' => 'required|numeric|min:0',
            'stops' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $stopsArray = array_filter(array_map('trim', explode("\n", $validated['stops'] ?? '')));
        $validated['stops'] = $stopsArray;

        $route->update($validated);
        return back()->with('success', 'Transport Route updated successfully.');
    }

    public function destroy($id)
    {
        TransportRoute::findOrFail($id)->delete();
        return back()->with('success', 'Transport Route deleted.');
    }
}
