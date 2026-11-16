<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->index('user_id');
        });
        Schema::table('guardians', fn (Blueprint $table) => $table->index('user_id'));

        Schema::create('teacher_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_class_teacher')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['staff_id', 'class_id', 'section_id', 'subject_id'], 'teacher_assignment_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_assignments');
        Schema::table('guardians', fn (Blueprint $table) => $table->dropIndex(['user_id']));
        Schema::table('staff', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropConstrainedForeignId('campus_id');
        });
    }
};
