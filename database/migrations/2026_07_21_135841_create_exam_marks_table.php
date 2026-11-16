<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exam_marks', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('exam_id');
            $table->unsignedInteger('school_class_id');
            $table->unsignedInteger('section_id')->nullable();
            $table->unsignedInteger('subject_id');
            $table->unsignedInteger('student_id');
            $table->decimal('marks_obtained', 5, 2)->nullable();
            $table->string('grade')->nullable(); 
            $table->decimal('grade_point', 4, 2)->nullable(); 
            $table->string('note')->nullable();
            $table->timestamps();
            $table->unique(['exam_id', 'subject_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_marks');
    }
};
