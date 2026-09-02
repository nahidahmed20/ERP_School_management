<?php

namespace Database\Seeders;

use App\Models\MenuGroup;
use App\Models\MenuItem;
use App\Services\MenuOrderService;
use Illuminate\Database\Seeder;

class StaffHrMenuSeeder extends Seeder
{
    public function run(): void
    {
        $group = MenuGroup::firstOrCreate(['label' => 'People'], ['order' => 4, 'is_active' => true]);
        $parent = MenuItem::firstOrCreate(['key' => 'staff'], [
            'menu_group_id' => $group->id, 'label' => 'Staff & HR', 'icon' => 'users', 'order' => 0, 'is_active' => true,
        ]);
        MenuItem::updateOrCreate(['key' => 'admin.staff-hr-records.index'], [
            'menu_group_id' => $group->id, 'parent_id' => $parent->id, 'label' => 'Teacher HR & Development',
            'route_name' => 'admin.staff-hr-records.index', 'permission' => 'admin.staff-hr-records.index',
            'order' => 6, 'is_active' => true,
        ]);
        $parent->update(['badge_count' => $parent->children()->count()]);
        app(MenuOrderService::class)->apply();
    }
}
