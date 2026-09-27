<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicalRoom;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicalRoomController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        $query = MedicalRoom::where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                  ->orWhere('nurse_name', 'like', "%{$search}%");
            });
        }

        $rooms = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/MedicalRooms/Index', [
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
            'room_number' => 'required|string|max:255',
            'nurse_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'total_beds' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        MedicalRoom::create($validated);

        return back()->with('success', 'Medical room added successfully.');
    }

    public function update(Request $request, $id)
    {
        $room = MedicalRoom::where('campus_id', config('app.active_campus_id'))->findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'room_number' => 'required|string|max:255',
            'nurse_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'total_beds' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $room->update($validated);

        return back()->with('success', 'Medical room updated successfully.');
    }

    public function destroy($id)
    {
        MedicalRoom::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        
        return back()->with('success', 'Medical room deleted successfully.');
    }
}