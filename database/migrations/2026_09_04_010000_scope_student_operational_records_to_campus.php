<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['student_documents', 'disciplinary_records', 'student_attendances'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->unsignedBigInteger('campus_id')->nullable()->after('id')->index());
            }

            DB::table($table)->whereNull('campus_id')->orderBy('id')->eachById(function ($record) use ($table) {
                DB::table($table)->where('id', $record->id)->update([
                    'campus_id' => DB::table('students')->where('id', $record->student_id)->value('campus_id'),
                ]);
            });
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $table) {
            if (Schema::hasColumn($table, 'campus_id')) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropColumn('campus_id'));
            }
        }
    }
};
