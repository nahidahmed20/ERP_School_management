<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaOutlet;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CafeteriaOutletController extends Controller
{
    public function index(Request $request)
    {
        $query = CafeteriaOutlet::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('manager_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        $outlets = $query->latest()->paginate(10)->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/CafeteriaOutlets/Index', [
            'outlets' => $outlets,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'manager_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        CafeteriaOutlet::create($validated);

        return back()->with('success', 'Outlet created successfully.');
    }

    public function update(Request $request, $id)
    {
        $outlet = CafeteriaOutlet::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'manager_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $outlet->update($validated);

        return back()->with('success', 'Outlet updated successfully.');
    }

    public function destroy($id)
    {
        CafeteriaOutlet::findOrFail($id)->delete();
        
        return back()->with('success', 'Outlet deleted successfully.');
    }
}