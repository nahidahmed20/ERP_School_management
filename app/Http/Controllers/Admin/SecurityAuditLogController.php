<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SecurityAuditLog::with('user:id,name,email,role');

        if ($search = $request->get('search')) {
            $query->where('action', 'like', "%{$search}%")
                  ->orWhere('model_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($action = $request->get('action_type')) {
            $query->where('action', $action);
        }

        $perPageRaw = $request->get('per_page', '50');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $logs = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $logs = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Security/AuditLogs/Index', [
            'auditLogs' => $logs,
            'filters' => [
                'search' => $request->get('search', ''),
                'action_type' => $request->get('action_type', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }
}
