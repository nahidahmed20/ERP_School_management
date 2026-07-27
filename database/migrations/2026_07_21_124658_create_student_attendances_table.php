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
        Schema::create('student_attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('student_id');
            $table->unsignedInteger('school_class_id');
            $table->unsignedInteger('section_id')->nullable();
            $table->unsignedInteger('academic_session_id');
            $table->date('attendance_date');
            $table->enum('status', ['present', 'absent', 'late', 'half_day'])->default('present');
            $table->string('remarks')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_attendances');
    }
};
