<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostelAllocation;
use App\Models\HostelRoom;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostelAllocationController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelAllocation::with(['room', 'user']);

        if ($search = $request->get('search')) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('room_id')) {
            $query->where('hostel_room_id', $request->get('room_id'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->latest('allocation_date');

        $perPage = $request->get('per_page', 10);
        $allocations = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/HostelAllocations/Index', [
            'allocations' => $allocations,
            'campuses' => Campus::select('id', 'name')->get(),
            'rooms' => HostelRoom::where('is_active', true)->select('id', 'hostel_name', 'room_number', 'cost_per_bed')->get(),
            'users' => User::select('id', 'name', 'email')->get(), 
            'filters' => $request->only(['search', 'room_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        HostelAllocation::create($data);

        return back()->with('success', 'হোস্টেল রুম সফলভাবে বরাদ্দ দেওয়া হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $allocation = HostelAllocation::findOrFail($id);
        $data = $this->validateData($request);
        $allocation->update($data);

        return back()->with('success', 'রুম বরাদ্দের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        HostelAllocation::findOrFail($id)->delete();
        return back()->with('success', 'রুম বরাদ্দ বাতিল করা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'hostel_room_id' => 'required|exists:hostel_rooms,id',
            'user_id' => 'required|exists:users,id',
            'allocation_date' => 'required|date',
            'monthly_fee' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);
    }
}