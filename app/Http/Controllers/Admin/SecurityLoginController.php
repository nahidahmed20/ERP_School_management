<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityLoginHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityLoginController extends Controller
{
    public function index(Request $request)
    {
        // Eager load the user relation to get user names and emails
        $query = SecurityLoginHistory::with('user:id,name,email,role');

        if ($search = $request->get('search')) {
            $query->where('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
        }

        $perPageRaw = $request->get('per_page', '50');
        
        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $logins = $query->latest('login_at')->paginate($totalCount)->withQueryString();
        } else {
            $logins = $query->latest('login_at')->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Security/Logins/Index', [
            'logins' => $logins,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }
}