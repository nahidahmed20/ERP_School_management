<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['exam_schedules', 'exam_marks', 'exam_mark_revisions'] as $table) {
            if (! Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->unsignedBigInteger('campus_id')->nullable()->after('id')->index());
            }
        }

        foreach (['exam_schedules', 'exam_marks'] as $table) {
            DB::table($table)->whereNull('campus_id')->orderBy('id')->eachById(function ($record) use ($table) {
                DB::table($table)->where('id', $record->id)->update([
                    'campus_id' => DB::table('exams')->where('id', $record->exam_id)->value('campus_id'),
                ]);
            });
        }

        DB::table('exam_mark_revisions')->whereNull('campus_id')->orderBy('id')->eachById(function ($record) {
            DB::table('exam_mark_revisions')->where('id', $record->id)->update([
                'campus_id' => DB::table('exam_marks')->where('id', $record->exam_mark_id)->value('campus_id'),
            ]);
        });
    }

    public function down(): void
    {
        foreach (['exam_mark_revisions', 'exam_marks', 'exam_schedules'] as $table) {
            if (Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropColumn('campus_id'));
            }
        }
    }
};
