<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        foreach (['enrollments', 'time_tables', 'exam_schedules', 'teacher_assignments', 'class_diaries', 'class_substitutions'] as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'section_id')) {
                Schema::table($tableName, fn (Blueprint $table) => $table->unsignedBigInteger('section_id')->nullable()->change());
            }
        }
    }

    public function down(): void
    {
        // Existing records may have no section, so making this required again is unsafe.
    }
};
