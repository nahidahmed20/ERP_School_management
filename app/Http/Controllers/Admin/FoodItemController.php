<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\CafeteriaOutlet;
use App\Models\Campus;
use App\Models\CafeteriaRawMaterial; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class FoodItemController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');

        $query = FoodItem::whereHas('outlet', function($q) use ($campusId) {
            $q->where('campus_id', $campusId);
        })->with(['outlet:id,name']);

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }
        if ($outletId = $request->get('outlet_id')) {
            $query->where('cafeteria_outlet_id', $outletId);
        }

        $items = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        
        $outlets = CafeteriaOutlet::where('campus_id', $campusId)->where('is_active', true)->select('id', 'name')->get();
        $campuses = Campus::select('id', 'name')->get();
        
        $rawMaterials = CafeteriaRawMaterial::where('campus_id', $campusId)->where('is_active', true)->select('id', 'name', 'stock_unit')->get();

        return Inertia::render('Admin/CafeteriaFoodItems/Index', [
            'items' => $items,
            'outlets' => $outlets,
            'rawMaterials' => $rawMaterials, 
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search', 'outlet_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'cafeteria_outlet_id' => 'required|exists:cafeteria_outlets,id',
            'cafeteria_raw_material_id' => 'nullable|exists:cafeteria_raw_materials,id', 
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'stock_unit' => 'required|string|max:50',
            'is_available' => 'boolean',
        ]);

        FoodItem::create($validated);
        return back()->with('success', 'Food item added successfully.');
    }

    public function update(Request $request, $id)
    {
        $food = FoodItem::findOrFail($id);
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'cafeteria_outlet_id' => 'required|exists:cafeteria_outlets,id',
            'cafeteria_raw_material_id' => 'nullable|exists:cafeteria_raw_materials,id', 
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'stock_unit' => 'required|string|max:50',
            'is_available' => 'boolean',
        ]);

        $food->update($validated);
        return back()->with('success', 'Food item updated.');
    }

    public function destroy($id)
    {
        FoodItem::findOrFail($id)->delete();
        return back()->with('success', 'Food item deleted.');
    }
}