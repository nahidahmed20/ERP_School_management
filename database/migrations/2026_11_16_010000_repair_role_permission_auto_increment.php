<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['roles', 'permissions'] as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'id')) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT");
            }
        }
    }

    public function down(): void
    {
        // Keep role and permission IDs auto-incrementing for future records.
    }
};
