<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['communication_chats', 'lesson_plans'] as $table) {
            if (! Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->unsignedBigInteger('campus_id')->nullable()->after('id')->index());
            }
        }
        DB::table('communication_chats')->whereNull('campus_id')->orderBy('id')->eachById(function ($row) {
            DB::table('communication_chats')->where('id', $row->id)->update(['campus_id' => DB::table('users')->where('id', $row->sender_id)->value('campus_id')]);
        });
        DB::table('lesson_plans')->whereNull('campus_id')->orderBy('id')->eachById(function ($row) {
            DB::table('lesson_plans')->where('id', $row->id)->update(['campus_id' => DB::table('school_classes')->where('id', $row->class_id)->value('campus_id')]);
        });
    }

    public function down(): void
    {
        foreach (['lesson_plans', 'communication_chats'] as $table) {
            if (Schema::hasColumn($table, 'campus_id')) Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropColumn('campus_id'));
        }
    }
};
