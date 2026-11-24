<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $item = DB::table('menu_items')->where('key', 'admin.owner-funding.index')->first();
        $chart = DB::table('menu_items')->where('key', 'admin.accounting.chart.index')->first();
        if (! $item || ! $chart || $item->parent_id !== $chart->parent_id) return;

        DB::table('menu_items')->where('parent_id', $item->parent_id)
            ->where('id', '!=', $item->id)->where('order', '>', $chart->order)
            ->increment('order');
        DB::table('menu_items')->where('id', $item->id)->update([
            'order' => $chart->order + 1,
            'updated_at' => now(),
        ]);
        Cache::forget('sidebar.navigation');
    }

    public function down(): void
    {
        // Keep the owner funding shortcut in the Finance menu.
    }
};
