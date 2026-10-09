<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityFailedLogin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityFailedLoginController extends Controller
{
    public function index(Request $request)
    {
        $query = SecurityFailedLogin::query();

        if (! $request->user()->hasRole('Super Admin') && config('app.active_campus_id')) {
            $campusId = config('app.active_campus_id');
            // Only show failed logins where the email belongs to a user in the active campus
            $query->whereIn('email_attempted', function($q) use ($campusId) {
                $q->select('email')->from('users')->where('campus_id', $campusId);
            });
        }

        if ($search = $request->get('search')) {
            $query->where('email_attempted', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '50');
        
        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $failedLogins = $query->latest('attempted_at')->paginate($totalCount)->withQueryString();
        } else {
            $failedLogins = $query->latest('attempted_at')->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Security/FailedLogins/Index', [
            'failedLogins' => $failedLogins,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }
}