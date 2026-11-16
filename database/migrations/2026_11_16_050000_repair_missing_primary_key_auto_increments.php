<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // The migration runner must be able to insert this migration's record.
        if (Schema::hasTable('migrations') && Schema::hasColumn('migrations', 'id')) {
            DB::statement('ALTER TABLE `migrations` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        if (DB::getDriverName() === 'mysql' && Schema::hasTable('settings') && Schema::hasColumn('settings', 'id')) {
            DB::statement('ALTER TABLE `settings` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
        }
    }

    public function down(): void
    {
        // Keep primary keys auto-incrementing when rolling back.
    }
};
