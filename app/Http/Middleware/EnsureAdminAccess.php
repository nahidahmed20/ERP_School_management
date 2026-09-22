<?php

namespace App\Http\Middleware;

use App\Models\MenuItem;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $routeName = $request->route()?->getName();
        $permission = $request->routeIs('admin.students.import.*')
            ? 'admin.students.store'
            : (MenuItem::where('route_name', $routeName)->value('permission') ?: $routeName);

        abort_unless(
            $user && $permission && $user->can($permission),
            Response::HTTP_FORBIDDEN,
            'You do not have permission to access this area.'
        );

        // These central operations manage explicit targets, not the working
        // campus. In particular, assigning a user's branch must remain possible.
        $centralOperation = $user->hasRole('Super Admin') && $request->routeIs(
            'admin.campus.switch', 'admin.campuses.*', 'admin.users.*',
            'admin.roles.*', 'admin.permissions.*', 'admin.menu.*',
            'admin.menu-groups.*', 'admin.saas.*', 'admin.security*',
            'admin.registry.*',
            'admin.general.website.update',
        );

        if (! $centralOperation && ! $request->isMethodSafe()) {
            $campusId = config('app.active_campus_id');
            if (! $campusId) {
                throw ValidationException::withMessages([
                    'campus_id' => $user->hasRole('Super Admin')
                        ? 'Select a working campus from the top bar before saving. No campus has been selected.'
                        : 'Your account has no assigned campus. Contact the Super Admin before saving.',
                ]);
            }

            // Do not silently send an old tab's form to a newly selected campus.
            $submittedCampus = $request->input('campus_id');
            if ($user->hasRole('Super Admin') && $request->filled('campus_id') && (
                ! is_scalar($submittedCampus) || ! ctype_digit((string) $submittedCampus)
                || (int) $submittedCampus !== (int) $campusId
            )) {
                throw ValidationException::withMessages([
                    'campus_id' => 'This form belongs to a different campus. Reload it after choosing the correct working campus from the top bar.',
                ]);
            }

            // Supply omitted campus fields as well as protecting ownership.
            $request->merge(['campus_id' => $campusId]);
        } elseif (! $centralOperation && $request->exists('campus_id')) {
            $request->merge(['campus_id' => config('app.active_campus_id')]);
        }

        return $next($request);
    }
}
