<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Campus;

class SetActiveCampus
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            if ($user->hasRole('Super Admin')) {
                if (session()->exists('active_campus_id')) {
                    $activeCampusId = session('active_campus_id');
                } else {
                    $mainCampus = Campus::where('is_main', true)->first();
                    $activeCampusId = $mainCampus->id ?? null;
                    session(['active_campus_id' => $activeCampusId]);
                }
            } else {
                $activeCampusId = $user->campus_id;
            }

            config(['app.active_campus_id' => $activeCampusId]);
        }

        return $next($request);
    }
}
