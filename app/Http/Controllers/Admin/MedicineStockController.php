<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicineStock;
use App\Models\MedicalRoom;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule; 

class MedicineStockController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        $query = MedicineStock::with('room')->where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('medicine_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $stocks = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        
        $rooms = MedicalRoom::where('campus_id', $activeCampusId)->where('is_active', true)->select('id', 'room_number')->get();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/MedicalMedicineStock/Index', [
            'stocks' => $stocks,
            'rooms' => $rooms,
            'campuses' => $campuses,
            'activeCampusId' => $activeCampusId,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => ['required', CampusRule::exists('medical_rooms')],
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
        $stock = MedicineStock::where('campus_id', config('app.active_campus_id'))->findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => ['required', CampusRule::exists('medical_rooms')],
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
        MedicineStock::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        
        return back()->with('success', 'Medicine deleted from stock successfully.');
    }
}