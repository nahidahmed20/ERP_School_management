<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportAllocation;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportAllocationController extends Controller
{
    public function index(Request $request)
    {
        $query = TransportAllocation::with(['vehicle', 'user']);

        if ($search = $request->get('search')) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('pickup_point', 'like', "%{$search}%");
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->get('vehicle_id'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $allocations = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/TransportAllocations/Index', [
            'allocations' => $allocations,
            'campuses' => Campus::select('id', 'name')->get(),
            'vehicles' => Vehicle::where('is_active', true)->select('id', 'vehicle_number', 'route_name')->get(),
            'users' => User::select('id', 'name', 'email')->get(), 
            'filters' => $request->only(['search', 'vehicle_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        TransportAllocation::create($data);
        return back()->with('success', 'ট্রান্সপোর্ট বরাদ্দ সফলভাবে সম্পন্ন হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $allocation = TransportAllocation::findOrFail($id);
        $data = $this->validateData($request);
        $allocation->update($data);
        return back()->with('success', 'বরাদ্দের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        TransportAllocation::findOrFail($id)->delete();
        return back()->with('success', 'বরাদ্দ বাতিল করা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'user_id' => 'required|exists:users,id',
            'pickup_point' => 'required|string|max:255',
            'monthly_fare' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);
    }
}