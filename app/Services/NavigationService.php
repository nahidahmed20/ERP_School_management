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

        return $data;
    }
}
