<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Campus;

class SetActiveCampus
{
    public function handle(Request $request, Closure $next)
    {
        // User itself is campus-scoped. Never authenticate using a previous
        // request's working campus (important for long-lived workers too).
        config(['app.active_campus_id' => null]);
        $user = $request->user();
        $campus = null;

        if ($user?->hasRole('Super Admin')) {
            $selectedId = $request->session()->get('active_campus_id');
            if (filter_var($selectedId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
                $campus = Campus::where('is_active', true)->find($selectedId);
            }
        } elseif ($user?->campus_id) {
            // Branch users cannot change context through a forged session/form.
            $campus = Campus::find($user->campus_id);
        }

        if ($campus) {
            $request->session()->put('active_campus_id', $campus->id);
        } else {
            // No implicit Main Campus fallback. A super admin must choose.
            $request->session()->forget('active_campus_id');
        }

        config(['app.active_campus_id' => $campus?->id]);
        $request->attributes->set('active_campus', $campus);

        try {
            return $next($request);
        } finally {
            config(['app.active_campus_id' => null]);
        }
    }
}
