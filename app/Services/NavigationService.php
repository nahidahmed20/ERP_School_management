<?php
namespace App\Services;

use App\Models\MenuGroup;
use App\Http\Resources\MenuGroupResource;
use Illuminate\Support\Facades\Auth;

class NavigationService
{

    protected function countResolvers(): array
    {
        return [
            // 'students' => fn () => \App\Models\Student::count(),
            // 'staff'    => fn () => \App\Models\Staff::count(),
        ];
    }

    public function getMenu(): array
    {
        $groups = MenuGroup::with(['items.children'])
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->filter(function ($group) {
                return true;
            });

        $resolvers = $this->countResolvers();

        $data = MenuGroupResource::collection($groups)->resolve();

        foreach ($data as &$group) {
            foreach ($group['items'] as &$item) {
                if (isset($resolvers[$item['key']])) {
                    $item['count'] = $resolvers[$item['key']]();
                }
            }
        }

        // Keep each destination in one logical place even when old database
        // menu rows still contain copies created by earlier seed data.
        $preferredKeys = [
            'admin.biometric.synclogs' => 'admin.biometric.synclogs',
            'admin.studentAttendance.report' => 'admin.reports.student_attendance',
            'admin.staff-attendance.index' => 'admin.staff-attendance.index',
        ];
        $seenRoutes = [];

        foreach ($data as &$group) {
            $uniqueItems = [];
            foreach ($group['items'] as $item) {
                $children = $item['children'] ?? [];
                if ($children) {
                    $item['children'] = array_values(array_filter($children, function (array $child) use (&$seenRoutes, $preferredKeys): bool {
                        $route = $child['route_name'] ?? $child['route'] ?? null;
                        $key = $child['key'] ?? null;
                        if (! $route || (isset($preferredKeys[$route]) && $preferredKeys[$route] !== $key) || isset($seenRoutes[$route])) {
                            return false;
                        }

                        $seenRoutes[$route] = true;
                        return true;
                    }));
                }

                $route = $item['route_name'] ?? $item['route'] ?? null;
                $key = $item['key'] ?? null;
                $hasChildren = ! empty($item['children']);
                if ($route) {
                    if ((isset($preferredKeys[$route]) && $preferredKeys[$route] !== $key) || isset($seenRoutes[$route])) {
                        if (! $hasChildren) {
                            continue;
                        }
                        $item['route'] = null;
                    } else {
                        $seenRoutes[$route] = true;
                    }
                }

                if (array_key_exists('children', $item) && ! $hasChildren && ! $route) {
                    continue;
                }
                $uniqueItems[] = $item;
            }
            $group['items'] = $uniqueItems;
        }

        return $data;
    }
}
