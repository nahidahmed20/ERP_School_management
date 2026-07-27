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
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campus_id')->nullable();
            $table->unsignedBigInteger('online_exam_id');
            $table->unsignedBigInteger('student_id'); // User ID of the student
            $table->date('attempt_date');
            $table->decimal('obtained_marks', 6, 2)->default(0.00);
            $table->enum('status', ['Passed', 'Failed', 'Pending Evaluation'])->default('Pending Evaluation');
            $table->text('admin_remarks')->nullable();
            $table->timestamps();
            $table->unique(['online_exam_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
