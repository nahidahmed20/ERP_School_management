<?php

namespace App\Http\Middleware;

use App\Models\Campus;
use App\Models\Event;
use App\Models\Setting; 
use App\Services\NavigationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\WebsiteSettingsService;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $activeCampusId = config('app.active_campus_id');
        $activeCampus = $request->attributes->get('active_campus');
        $canSwitchCampus = (bool) $request->user()?->hasRole('Super Admin');
        $schoolName = ! $request->user() ? app(WebsiteSettingsService::class)->values()['school_name']
            : Setting::withoutGlobalScope('campus')->where('key', 'school_name')
            ->where(function ($query) use ($activeCampusId) {
                $query->where('campus_id', $activeCampusId)
                      ->orWhereNull('campus_id');
            })
            ->orderBy('campus_id', 'desc') 
            ->value('value');

        return [
            ...parent::share($request),

            'global_settings' => [
                'school_name' => $schoolName ?? config('app.name', 'Your School Name'),
            ],

            'auth' => [
                'user' => function () use ($request) {
                    $user = $request->user();
                    if (! $user) return null;
                    $user->loadMissing('roles', 'permissions');
                    return $user->attributesToArray() + [
                        'roles' => $user->roles->map->only(['id', 'name', 'guard_name'])->all(),
                        'permissions' => $user->permissions->map->only(['id', 'name', 'guard_name'])->all(),
                    ];
                },
                'active_campus_id' => $activeCampusId,
                'active_campus' => $activeCampus ? $activeCampus->only(['id', 'name']) : null,
                'can_switch_campus' => $canSwitchCampus,
                'requires_campus_selection' => $canSwitchCampus && ! $activeCampusId,
                'topbar_permissions' => function () use ($request) {
                    $routes = ['admin.students.create', 'admin.staff.create', 'admin.students.index',
                        'admin.staff.index', 'admin.fees.invoices', 'admin.communication-notifications.index',
                        'admin.general.index'];
                    if (! $request->user()) return array_fill_keys($routes, false);
                    $permissions = \App\Models\MenuItem::whereIn('route_name', $routes)->pluck('permission', 'route_name');
                    return collect($routes)->mapWithKeys(fn ($route) => [
                        $route => (bool) $request->user()?->can(($permissions[$route] ?? null) ?: $route),
                    ])->all();
                },
            ],

            'all_campuses' => function () use ($canSwitchCampus) {
                if ($canSwitchCampus) {
                    return Campus::where('is_active', true)->orderBy('order')->orderBy('name')->get(['id', 'name']);
                }

                return [];
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'site_settings' => fn () => app(WebsiteSettingsService::class)->values(),

            'dashboard_alerts' => function () use ($request) {
                $user = $request->user();
                if (! $user) return [];

                $user->loadMissing('student', 'guardian', 'staff');
                $audience = $user->student ? 'student' : ($user->guardian ? 'parent' : ($user->staff ? 'staff' : 'all'));

                return Event::query()
                    ->where('is_active', true)
                    ->where('show_on_dashboard', true)
                    ->whereIn('audience', ['all', $audience])
                    ->where('end_datetime', '>=', now()->startOfDay())
                    ->where('start_datetime', '<=', now()->addDays(7)->endOfDay())
                    ->orderBy('start_datetime')
                    ->take(5)
                    ->get()
                    ->map(fn (Event $event) => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'type' => $event->type,
                        'is_government_holiday' => $event->is_government_holiday,
                        'starts_at' => $event->start_datetime?->format('d M Y, h:i A'),
                        'is_today' => $event->start_datetime?->isToday(),
                    ]);
            },

            'navigation' => function () use ($request) {
                $user = $request->user();
                if (! $user) {
                    return [];
                }

                $rawMenus = Cache::remember(
                    'sidebar.navigation',
                    now()->addHour(),
                    fn () => app(NavigationService::class)->getMenu()
                );

                $menusArray = json_decode(json_encode($rawMenus), true);

                $isSuperAdmin = $user->hasRole('Super Admin') || $user->role === 'Super Admin' || $user->role === 'super_admin';

                if ($isSuperAdmin) {
                    return $menusArray;
                }

                return collect($menusArray)->map(function ($group) use ($user) {
                    $filteredItems = collect($group['items'] ?? [])->map(function ($item) use ($user) {
                        if (! empty($item['children'])) {
                            $item['children'] = collect($item['children'])->filter(function ($child) use ($user) {
                                $route = $child['route_name'] ?? $child['route'] ?? null;
                                $permission = $child['permission'] ?? $route;

                                return ! empty($route) && $user->can($permission);
                            })->values()->all();
                        }

                        return $item;
                    })->filter(function ($item) use ($user) {
                        if (array_key_exists('children', $item) && is_array($item['children'])) {
                            return count($item['children']) > 0;
                        }

                        $route = $item['route_name'] ?? $item['route'] ?? null;
                        $permission = $item['permission'] ?? $route;
                        return ! empty($route) && $user->can($permission);
                    })->values()->all();

                    $group['items'] = $filteredItems;

                    return $group;
                })->filter(function ($group) {
                    return ! empty($group['items']);
                })->values()->all();
            },
        ];
    }
}
