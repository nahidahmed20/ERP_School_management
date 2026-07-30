<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\CafeteriaOutlet;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FoodItemController extends Controller
{
    public function index(Request $request)
    {
        $query = FoodItem::with('outlet');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $items = $query->latest()->paginate(10)->withQueryString();
        $outlets = CafeteriaOutlet::where('is_active', true)->select('id', 'name')->get();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/CafeteriaFoodItems/Index', [
            'items' => $items,
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
            'cafeteria_outlet_id' => 'required|exists:cafeteria_outlets,id',
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
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
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
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