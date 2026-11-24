<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $group = DB::table('menu_groups')->where('label', 'Settings & Registry')->first();
        if (! $group) {
            $groupId = DB::table('menu_groups')->insertGetId([
                'label' => 'Settings & Registry',
                'order' => (int) DB::table('menu_groups')->max('order') + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $groupId = (int) $group->id;
            DB::table('menu_groups')->where('id', $groupId)->update(['is_active' => true, 'updated_at' => now()]);
        }

        $item = DB::table('menu_items')->where('key', 'admin.menu.index')->first();
        $data = [
            'menu_group_id' => $groupId,
            'parent_id' => null,
            'label' => 'Menu Manager',
            'icon' => 'settings',
            'route_name' => 'admin.menu.index',
            'permission' => 'admin.menu.index',
            'is_active' => true,
            'updated_at' => now(),
        ];

        if ($item) {
            DB::table('menu_items')->where('id', $item->id)->update($data);
        } else {
            DB::table('menu_items')->insert($data + [
                'key' => 'admin.menu.index',
                'order' => (int) DB::table('menu_items')->where('menu_group_id', $groupId)->max('order') + 1,
                'created_at' => now(),
            ]);
        }

        Cache::forget('sidebar.navigation');
    }

    public function down(): void
    {
        // Keep the navigation entry: a deployment may already have custom data attached to it.
    }
};
