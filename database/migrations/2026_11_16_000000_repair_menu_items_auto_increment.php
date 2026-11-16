<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('menu_items') && Schema::hasColumn('menu_items', 'id')) {
            DB::statement('ALTER TABLE `menu_items` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
        }
    }

    public function down(): void
    {
        // Keep menu IDs auto-incrementing so new menu entries remain insertable.
    }
};
