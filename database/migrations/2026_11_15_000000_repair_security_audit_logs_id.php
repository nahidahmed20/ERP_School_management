<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Laravel must be able to record this migration after up() completes.
        if (Schema::hasTable('migrations') && Schema::hasColumn('migrations', 'id')) {
            DB::statement('ALTER TABLE `migrations` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        if (! Schema::hasTable('security_audit_logs') || ! Schema::hasColumn('security_audit_logs', 'id')) {
            return;
        }

        DB::statement('ALTER TABLE `security_audit_logs` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    }

    public function down(): void
    {
        // Keep the audit log primary key auto-incrementing when rolling back.
    }
};
