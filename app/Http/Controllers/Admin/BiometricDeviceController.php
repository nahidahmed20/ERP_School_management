<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{BiometricDevice, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class BiometricDeviceController extends Controller
{
    public function index(Request $request)
    {
        $query = BiometricDevice::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $devices = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $devices = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Biometric/Devices/Index', [
            'devices' => $devices,
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'port' => 'required|string|max:10',
            'serial_number' => 'required|string|unique:biometric_devices,serial_number',
            'status' => 'required|string',
        ]);

        BiometricDevice::create($validated);
        return back()->with('success', 'Device added successfully.');
    }

    public function update(Request $request, $id)
    {
        $device = BiometricDevice::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'port' => 'required|string|max:10',
            'serial_number' => 'required|string|unique:biometric_devices,serial_number,'.$id,
            'status' => 'required|string',
        ]);

        $device->update($validated);
        return back()->with('success', 'Device updated successfully.');
    }

    public function destroy($id)
    {
        BiometricDevice::findOrFail($id)->delete();
        return back()->with('success', 'Device deleted.');
    }
}
