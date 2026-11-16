<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homework_submissions', function (Blueprint $table) {
            $table->id(); $table->foreignId('homework_id')->constrained('homeworks')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->text('answer')->nullable(); $table->string('attachment_path')->nullable();
            $table->timestamp('submitted_at'); $table->string('status')->default('Submitted');
            $table->decimal('marks_obtained', 6, 2)->nullable(); $table->text('teacher_feedback')->nullable();
            $table->timestamp('evaluated_at')->nullable(); $table->timestamps();
            $table->unique(['homework_id', 'student_id']);
        });
        Schema::create('student_leave_requests', function (Blueprint $table) {
            $table->id(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type'); $table->date('start_date'); $table->date('end_date');
            $table->text('reason'); $table->string('attachment_path')->nullable();
            $table->string('parent_status')->default('Pending'); $table->string('school_status')->default('Pending');
            $table->text('review_note')->nullable(); $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('attendance_correction_requests', function (Blueprint $table) {
            $table->id(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date'); $table->string('current_status')->nullable(); $table->string('requested_status');
            $table->text('reason'); $table->string('status')->default('Pending'); $table->text('review_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps();
            $table->unique(['student_id', 'attendance_date']);
        });
        Schema::create('student_profile_update_requests', function (Blueprint $table) {
            $table->id(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->json('changes'); $table->text('reason')->nullable(); $table->string('status')->default('Pending');
            $table->text('review_note')->nullable(); $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('student_task_completions', function (Blueprint $table) {
            $table->id(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('task_type'); $table->unsignedBigInteger('task_id'); $table->timestamp('completed_at')->nullable();
            $table->timestamps(); $table->unique(['student_id', 'task_type', 'task_id']);
        });
        Schema::create('library_reservations', function (Blueprint $table) {
            $table->id(); $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('status')->default('Pending');
            $table->date('requested_at'); $table->date('expires_at')->nullable(); $table->text('note')->nullable();
            $table->timestamps(); $table->unique(['book_id', 'user_id', 'status']);
        });
        Schema::create('online_exam_answers', function (Blueprint $table) {
            $table->id(); $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_bank_id')->constrained()->cascadeOnDelete(); $table->text('answer')->nullable();
            $table->boolean('is_correct')->nullable(); $table->decimal('awarded_marks', 6, 2)->nullable();
            $table->text('feedback')->nullable(); $table->timestamps(); $table->unique(['quiz_attempt_id', 'question_bank_id']);
        });
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable(); $table->timestamp('submitted_at')->nullable();
        });
        Schema::table('exam_marks', function (Blueprint $table) {
            $table->decimal('written_marks', 6, 2)->nullable(); $table->decimal('practical_marks', 6, 2)->nullable();
            $table->decimal('viva_marks', 6, 2)->nullable(); $table->decimal('full_marks', 6, 2)->nullable();
            $table->decimal('pass_marks', 6, 2)->nullable();
        });
        Schema::table('helpdesk_tickets', fn (Blueprint $table) => $table->foreignId('user_id')->nullable()->after('campus_id')->constrained()->nullOnDelete());
        Schema::table('student_attendances', fn (Blueprint $table) => $table->boolean('is_excused')->default(false)->after('status'));
    }

    public function down(): void
    {
        Schema::table('student_attendances', fn (Blueprint $table) => $table->dropColumn('is_excused'));
        Schema::table('helpdesk_tickets', fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
        Schema::table('exam_marks', fn (Blueprint $table) => $table->dropColumn(['written_marks','practical_marks','viva_marks','full_marks','pass_marks']));
        Schema::table('quiz_attempts', fn (Blueprint $table) => $table->dropColumn(['started_at','submitted_at']));
        foreach (['online_exam_answers','library_reservations','student_task_completions','student_profile_update_requests','attendance_correction_requests','student_leave_requests','homework_submissions'] as $table) Schema::dropIfExists($table);
    }
};
