<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('security_login_histories') && Schema::hasColumn('security_login_histories', 'id')) {
            DB::statement('ALTER TABLE `security_login_histories` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        if (Schema::hasTable('security_audit_logs') && Schema::hasColumn('security_audit_logs', 'id')) {
            DB::statement('ALTER TABLE `security_audit_logs` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
        }
    }

    public function down(): void
    {
        // Keep these primary keys auto-incrementing when rolling back.
    }
};
