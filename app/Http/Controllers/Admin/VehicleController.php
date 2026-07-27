<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query();

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('vehicle_number', 'like', "%{$search}%")
                  ->orWhere('route_name', 'like', "%{$search}%")
                  ->orWhere('driver_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('route_name', 'asc');

        $perPage = $request->get('per_page', 10);
        $vehicles = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/TransportVehicles/Index', [
            'vehicles' => $vehicles,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Vehicle::create($data);

        return back()->with('success', 'নতুন Vehicle ও রুট যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $data = $this->validateData($request, $vehicle->id);
        $vehicle->update($data);

        return back()->with('success', 'Vehicle এর তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return back()->with('success', 'Vehicle মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? session('active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'vehicle_number' => [
                'required', 'string', 'max:50',
                Rule::unique('vehicles', 'vehicle_number')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'vehicle_model' => 'nullable|string|max:100',
            'driver_name' => 'required|string|max:100',
            'driver_phone' => 'required|string|max:20',
            'route_name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'note' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}