<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicineStock;
use App\Models\MedicalRoom;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineStockController extends Controller
{
    public function index(Request $request)
    {
        $query = MedicineStock::with('room');

        if ($search = $request->get('search')) {
            $query->where('medicine_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        $stocks = $query->latest()->paginate(10)->withQueryString();
        $rooms = MedicalRoom::where('is_active', true)->select('id', 'room_number')->get();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/MedicalMedicineStock/Index', [
            'stocks' => $stocks,
            'rooms' => $rooms,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => 'required|exists:medical_rooms,id',
            'medicine_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        MedicineStock::create($validated);

        return back()->with('success', 'Medicine added to stock successfully.');
    }

    public function update(Request $request, $id)
    {
        $stock = MedicineStock::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => 'required|exists:medical_rooms,id',
            'medicine_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        $stock->update($validated);

        return back()->with('success', 'Medicine stock updated successfully.');
    }

    public function destroy($id)
    {
        MedicineStock::findOrFail($id)->delete();
        return back()->with('success', 'Medicine deleted from stock successfully.');
    }
}