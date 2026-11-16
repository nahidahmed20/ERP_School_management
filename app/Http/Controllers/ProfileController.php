<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $databaseSessions = config('session.driver') === 'database';
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'account' => [
                'roles' => $user->getRoleNames(),
                'assigned_campus' => $user->campus?->only(['id', 'name']),
                'two_factor_enabled' => (bool) $user->two_factor_enabled,
                'password_changed_at' => $user->password_changed_at?->toIso8601String(),
            ],
            'sessionsAvailable' => $databaseSessions,
            'activeSessions' => $databaseSessions ? DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->where('last_activity', '>=', now()->subMinutes((int) config('session.lifetime', 120))->timestamp)
                ->orderByDesc('last_activity')->limit(20)->get(['id', 'ip_address', 'user_agent', 'last_activity'])
                ->map(fn ($session) => [
                    'current' => hash_equals($request->session()->getId(), $session->id),
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_active_at' => date(DATE_ATOM, $session->last_activity),
                ])->all() : [],
        ]);
    }

    public function destroyOtherSessions(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        abort_unless(config('session.driver') === 'database', 422, 'Session management requires the database session driver.');

        // Revoking database rows alone would let old remember-me cookies sign
        // the other devices back in. Invalidate those cookies as well.
        $request->user()->forceFill(['remember_token' => \Illuminate\Support\Str::random(60)])->save();

        DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())->delete();

        return back()->with('status', 'other-sessions-logged-out');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
