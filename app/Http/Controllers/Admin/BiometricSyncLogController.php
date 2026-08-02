<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BiometricSyncLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BiometricSyncLogController extends Controller
{
    public function index(Request $request)
    {
        $query = BiometricSyncLog::with(['device:id,name', 'enrolledUser:id,user_name,user_type']);

        if ($search = $request->get('search')) {
            $query->where('biometric_id', 'like', "%{$search}%")
                  ->orWhereHas('enrolledUser', function($q) use ($search) {
                      $q->where('user_name', 'like', "%{$search}%");
                  });
        }
        
        if ($status = $request->get('sync_status')) {
            $query->where('sync_status', $status);
        }

        $perPageRaw = $request->get('per_page', '50'); 
        
        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $logs = $query->latest('punch_time')->paginate($totalCount)->withQueryString();
        } else {
            $logs = $query->latest('punch_time')->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Biometric/SyncLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $request->get('search', ''),
                'sync_status' => $request->get('sync_status', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }
}