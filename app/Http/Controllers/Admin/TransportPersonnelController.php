<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportPersonnel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportPersonnelController extends Controller
{
    public function index(Request $request)
    {
        $query = TransportPersonnel::where('campus_id', config('app.active_campus_id'));

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('license_no', 'like', "%{$search}%");
            });
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $personnel = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $personnel = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/TransportPersonnel/Index', [
            'personnel' => $personnel,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:driver,helper',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'license_no' => 'nullable|string|max:100',
            'license_expires_at' => 'nullable|date',
            'national_id' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $validated['campus_id'] = config('app.active_campus_id');

        TransportPersonnel::create($validated);
        return back()->with('success', 'Personnel added successfully.');
    }

    public function update(Request $request, $id)
    {
        $personnel = TransportPersonnel::where('campus_id', config('app.active_campus_id'))->findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:driver,helper',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'license_no' => 'nullable|string|max:100',
            'license_expires_at' => 'nullable|date',
            'national_id' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $personnel->update($validated);
        return back()->with('success', 'Personnel updated successfully.');
    }

    public function destroy($id)
    {
        $personnel = TransportPersonnel::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $personnel->delete();

        return back()->with('success', 'Personnel deleted.');
    }
}
