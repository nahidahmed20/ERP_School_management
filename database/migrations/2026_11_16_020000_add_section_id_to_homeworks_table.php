<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Laravel must be able to record this migration after up() completes.
        if (Schema::hasTable('migrations') && Schema::hasColumn('migrations', 'id')) {
            DB::statement('ALTER TABLE `migrations` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        if (Schema::hasTable('homeworks') && ! Schema::hasColumn('homeworks', 'section_id')) {
            Schema::table('homeworks', function (Blueprint $table) {
                $table->foreignId('section_id')->nullable()->after('school_class_id')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('homeworks') && Schema::hasColumn('homeworks', 'section_id')) {
            Schema::table('homeworks', fn (Blueprint $table) => $table->dropConstrainedForeignId('section_id'));
        }
    }
};
