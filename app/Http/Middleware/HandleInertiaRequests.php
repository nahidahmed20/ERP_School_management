<?php

namespace App\Http\Middleware;

use App\Models\Campus;
use App\Services\NavigationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user() ? clone $request->user()->load('campus') : null,
                'active_campus_id' => config('app.active_campus_id'), 
            ],

            'all_campuses' => function () use ($request) {
                $user = $request->user();
                if ($user && ($user->hasRole('Super Admin') || $user->role === 'Super Admin' || $user->role === 'super_admin')) {
                    return Campus::select('id', 'name')->get();
                }
                return [];
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'navigation' => function () use ($request) {
                $user = $request->user();
                if (!$user) return [];

                $rawMenus = Cache::remember(
                    'sidebar.navigation',
                    now()->addHour(),
                    fn () => app(NavigationService::class)->getMenu()
                );

                $menusArray = json_decode(json_encode($rawMenus), true);

                if ($user->hasRole('Super Admin')) {
                    return $menusArray;
                }

                return collect($menusArray)->map(function ($group) use ($user) {

                    $filteredItems = collect($group['items'] ?? [])->map(function ($item) use ($user) {

                        if (!empty($item['children'])) {
                            $item['children'] = collect($item['children'])->filter(function ($child) use ($user) {
                                $route = $child['route_name'] ?? $child['route'] ?? null;
                                return !empty($route) && $user->can($route);
                            })->values()->all();
                        }

                        return $item;

                    })->filter(function ($item) use ($user) {

                        if (array_key_exists('children', $item) && is_array($item['children'])) {
                            return count($item['children']) > 0;
                        }

                        $route = $item['route_name'] ?? $item['route'] ?? null;
                        if (in_array($route, ['admin.dashboard', 'dashboard'])) {
                            return true;
                        }

                        return !empty($route) && $user->can($route);

                    })->values()->all();

                    $group['items'] = $filteredItems;
                    return $group;

                })->filter(function ($group) {
                    return !empty($group['items']);
                })->values()->all();
            },
            
        ];
    }
}