<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $groupId = DB::table('menu_groups')->where('label', 'Finance')->value('id');
        if (! $groupId) return;

        $parentId = DB::table('menu_items')->where('key', 'fees')->where('menu_group_id', $groupId)->value('id');
        if (! $parentId) return;

        $item = DB::table('menu_items')->where('key', 'admin.owner-funding.index')->first();
        $data = [
            'menu_group_id' => $groupId,
            'parent_id' => $parentId,
            'label' => 'Owner Investment & Funding',
            'icon' => null,
            'route_name' => 'admin.owner-funding.index',
            'permission' => 'admin.accounting.vouchers.index',
            'is_active' => true,
            'updated_at' => now(),
        ];
        if ($item) {
            DB::table('menu_items')->where('id', $item->id)->update($data);
        } else {
            DB::table('menu_items')->insert($data + [
                'key' => 'admin.owner-funding.index',
                'order' => (int) DB::table('menu_items')->where('parent_id', $parentId)->max('order') + 1,
                'created_at' => now(),
            ]);
        }

        DB::table('menu_items')->where('id', $parentId)->update([
            'badge_count' => DB::table('menu_items')->where('parent_id', $parentId)->count(),
            'updated_at' => now(),
        ]);
        Cache::forget('sidebar.navigation');
    }

    public function down(): void
    {
        // Keep the user-facing finance entry to avoid detaching existing vouchers.
    }
};
