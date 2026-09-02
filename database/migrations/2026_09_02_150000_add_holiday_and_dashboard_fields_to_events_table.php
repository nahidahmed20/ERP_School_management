<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('is_government_holiday')->default(false)->after('type');
            $table->boolean('show_on_dashboard')->default(false)->after('is_active');
            $table->string('audience', 30)->default('all')->after('show_on_dashboard');
            $table->string('source_name')->nullable()->after('audience');
            $table->text('source_reference')->nullable()->after('source_name');
            $table->string('source_key', 64)->nullable()->after('source_reference');
            $table->unique(['campus_id', 'source_key'], 'events_campus_source_unique');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique('events_campus_source_unique');
            $table->dropColumn(['is_government_holiday', 'show_on_dashboard', 'audience', 'source_name', 'source_reference', 'source_key']);
        });
    }
};
