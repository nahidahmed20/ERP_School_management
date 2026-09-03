<?php

namespace App\Http\Middleware;

use App\Models\MenuItem;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $routeName = $request->route()?->getName();
        $permission = MenuItem::where('route_name', $routeName)->value('permission') ?: $routeName;

        abort_unless(
            $user && $permission && $user->can($permission),
            Response::HTTP_FORBIDDEN,
            'You do not have permission to access this area.'
        );

        // Campus ownership is derived from the authenticated context, never from
        // a writable form field. Super admins select the context via switchCampus.
        if ($routeName !== 'admin.campus.switch' && $request->exists('campus_id')) {
            $request->merge(['campus_id' => config('app.active_campus_id')]);
        }

        return $next($request);
    }
}
