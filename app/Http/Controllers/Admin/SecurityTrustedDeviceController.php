<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityTrustedDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityTrustedDeviceController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');
        $query = SecurityTrustedDevice::with('user:id,name,email');
        $query->where(function($q) use ($activeCampusId) {
            $q->whereHas('user', function($u) use ($activeCampusId) {
                $u->where('campus_id', $activeCampusId)->orWhereNull('campus_id');
            })->orWhereNull('user_id');
        });

        if ($search = $request->get('search')) {
            $query->where('device_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
        }

        $perPageRaw = $request->get('per_page', '10');
        
        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $devices = $query->latest('last_used_at')->paginate($totalCount)->withQueryString();
        } else {
            $devices = $query->latest('last_used_at')->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Security/Devices/Index', [
            'trustedDevices' => $devices,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function destroy($id)
    {
        $activeCampusId = config('app.active_campus_id');
        SecurityTrustedDevice::where(function($q) use ($activeCampusId) {
            $q->whereHas('user', function($u) use ($activeCampusId) {
                $u->where('campus_id', $activeCampusId)->orWhereNull('campus_id');
            })->orWhereNull('user_id');
        })->findOrFail($id)->delete();
        return back()->with('success', 'Trusted device revoked successfully.');
    }
}