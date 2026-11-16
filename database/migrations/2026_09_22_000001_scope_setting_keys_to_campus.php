<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('settings_key_unique');
            $table->unique(['campus_id', 'key'], 'settings_campus_key_unique');
        });
    }

    public function down(): void
    {
        // Never discard branch settings just to restore the older constraint.
        if (DB::table('settings')->select('key')->groupBy('key')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Cannot restore global setting-key uniqueness while campus-specific keys exist.');
        }
        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('settings_campus_key_unique');
            $table->unique('key');
        });
    }
};
