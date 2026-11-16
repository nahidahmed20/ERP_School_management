<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostelRoom;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostelRoomController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelRoom::query();

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('hostel_name', 'like', "%{$search}%")
                  ->orWhere('room_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('room_type', $request->get('type'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('hostel_name', 'asc')->orderBy('room_number', 'asc');

        $perPage = $request->get('per_page', 10);
        $rooms = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/HostelRooms/Index', [
            'rooms' => $rooms,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'type', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        HostelRoom::create($data);

        return back()->with('success', 'নতুন হোস্টেল রুম যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $room = HostelRoom::findOrFail($id);
        $data = $this->validateData($request, $room->id);
        $room->update($data);

        return back()->with('success', 'রুমের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $room = HostelRoom::findOrFail($id);
        $room->delete();

        return back()->with('success', 'রুমটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'hostel_name' => 'required|string|max:100',
            'room_number' => 'required|string|max:50',
            'room_type' => 'required|string|max:50',
            'bed_capacity' => 'required|integer|min:1',
            'cost_per_bed' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}