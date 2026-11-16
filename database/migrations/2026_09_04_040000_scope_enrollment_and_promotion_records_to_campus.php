<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['enrollments', 'promotion_histories'] as $table) {
            if (! Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->unsignedBigInteger('campus_id')->nullable()->after('id')->index());
            }
        }
        DB::table('enrollments')->whereNull('campus_id')->orderBy('id')->eachById(function ($record) {
            DB::table('enrollments')->where('id', $record->id)->update(['campus_id' => DB::table('students')->where('id', $record->student_id)->value('campus_id')]);
        });
        DB::table('promotion_histories')->whereNull('campus_id')->orderBy('id')->eachById(function ($record) {
            DB::table('promotion_histories')->where('id', $record->id)->update(['campus_id' => DB::table('students')->where('id', $record->student_id)->value('campus_id')]);
        });
    }

    public function down(): void
    {
        foreach (['promotion_histories', 'enrollments'] as $table) {
            if (Schema::hasColumn($table, 'campus_id')) Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropColumn('campus_id'));
        }
    }
};
