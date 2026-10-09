<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\BiometricDevice;
use App\Models\BiometricEnrolledUser;
use App\Models\SecurityTrustedDevice;
use App\Models\BiometricSyncLog;
use Carbon\Carbon;

class DeviceHealthController extends Controller
{
    public function index()
    {
        // 1. Biometric Devices Status
        $biometricDevices = BiometricDevice::all();
        $totalDevices = $biometricDevices->count();
        $onlineDevices = $biometricDevices->where('status', 'Online')->count();
        $offlineDevices = $biometricDevices->where('status', 'Offline')->count();

        // 2. Sync Logs (Last 24 Hours)
        $recentSyncs = BiometricSyncLog::with(['device:id,name', 'enrolledUser:id,user_name'])
            ->where('punch_time', '>=', Carbon::now()->subDay())
            ->latest()
            ->take(20)
            ->get();

        // 3. Trusted Devices Statistics
        $trustedDevicesCount = SecurityTrustedDevice::count();
        $recentTrustedDevices = SecurityTrustedDevice::with('user:id,name')
            ->latest('last_used_at')
            ->take(10)
            ->get();

        // 4. Total Enrolled Users
        $totalEnrolledUsers = BiometricEnrolledUser::where('is_active', true)->count();

        return Inertia::render('Admin/System/DeviceHealth/Index', [
            'stats' => [
                'total_biometric_devices' => $totalDevices,
                'online_devices' => $onlineDevices,
                'offline_devices' => $offlineDevices,
                'total_trusted_devices' => $trustedDevicesCount,
                'total_enrolled_users' => $totalEnrolledUsers,
            ],
            'recentSyncs' => $recentSyncs,
            'recentTrustedDevices' => $recentTrustedDevices,
        ]);
    }
}
