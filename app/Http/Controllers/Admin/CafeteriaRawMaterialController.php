<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaRawMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CafeteriaRawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = CafeteriaRawMaterial::where('campus_id', config('app.active_campus_id'));

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $materials = $query->latest()->paginate((int) $request->get('per_page', 15))->withQueryString();

        return Inertia::render('Admin/CafeteriaRawMaterials/Index', [
            'materials' => $materials,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'stock_unit' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $validated['campus_id'] = config('app.active_campus_id');
        CafeteriaRawMaterial::create($validated);

        return back()->with('success', 'Raw material added to kitchen inventory.');
    }

    public function update(Request $request, $id)
    {
        $material = CafeteriaRawMaterial::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'stock_unit' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $material->update($validated);

        return back()->with('success', 'Kitchen inventory updated.');
    }

    public function destroy($id)
    {
        CafeteriaRawMaterial::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        return back()->with('success', 'Raw material deleted.');
    }
}