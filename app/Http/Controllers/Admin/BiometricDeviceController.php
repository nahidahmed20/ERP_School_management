<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{BiometricDevice, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BiometricEnrolledUser;
use App\Services\BiometricAttendanceService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

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
            'enrolledUsers' => BiometricEnrolledUser::where('is_active', true)->get(['biometric_id','user_name','user_type']),
        ]);
    }

    public function token(BiometricDevice $device)
    {
        $token=Str::random(48);$device->update(['api_token_hash'=>hash('sha256',$token),'sync_mode'=>'push']);
        return back()->with('success','Push token generated. Copy it now: '.$token);
    }

    public function sync(BiometricDevice $device)
    {
        Artisan::call('attendance:sync',['--device'=>$device->id]);
        return back()->with($device->fresh()->status==='Online'?'success':'error',trim(Artisan::output()));
    }

    public function simulate(Request $request,BiometricDevice $device,BiometricAttendanceService $service)
    {
        $data=$request->validate(['biometric_id'=>'required|exists:biometric_enrolled_users,biometric_id','punch_time'=>'required|date']);
        $log=$service->ingest($device,$data+['state'=>'Simulator']);
        return back()->with($log->sync_status==='Success'?'success':'error',$log->sync_status==='Success'?'Test punch synced successfully.':$log->error_message);
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
