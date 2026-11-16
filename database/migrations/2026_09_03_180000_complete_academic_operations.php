<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('exams', 'approval_status')) Schema::table('exams', function (Blueprint $table) {
            $table->string('approval_status')->default('draft')->after('results_published_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable(); $table->timestamp('locked_at')->nullable();
        });

        if (! Schema::hasTable('exam_mark_revisions')) Schema::create('exam_mark_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_mark_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('reason');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        if (! Schema::hasTable('syllabus_topics')) Schema::create('syllabus_topics', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('title'); $table->date('planned_date')->nullable();
            $table->string('status')->default('planned');
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        if (! Schema::hasTable('class_diaries')) Schema::create('class_diaries', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date'); $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->constrained('staff')->cascadeOnDelete();
            $table->string('topic'); $table->text('homework')->nullable(); $table->text('notes')->nullable();
            $table->timestamps();
        });

        if (! Schema::hasTable('class_substitutions')) Schema::create('class_substitutions', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date'); $table->foreignId('time_table_id')->nullable()->constrained('time_tables')->nullOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('absent_teacher_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('substitute_teacher_id')->constrained('staff')->cascadeOnDelete();
            $table->time('start_time')->nullable(); $table->time('end_time')->nullable();
            $table->text('reason')->nullable(); $table->string('status')->default('assigned'); $table->timestamps();
        });

        if (! Schema::hasColumn('parent_teacher_meetings', 'campus_id')) Schema::table('parent_teacher_meetings', fn (Blueprint $table) => $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete());

        if (! Schema::hasTable('student_transfers')) Schema::create('student_transfers', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('previous_enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            $table->string('type'); $table->date('effective_date'); $table->text('reason');
            $table->string('destination_school')->nullable(); $table->string('certificate_no')->nullable()->unique();
            $table->string('status')->default('requested');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable(); $table->timestamps();
        });

        if (! Schema::hasTable('promotion_histories')) Schema::create('promotion_histories', function (Blueprint $table) {
            $table->id(); $table->uuid('batch_uuid')->index();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('previous_enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            $table->foreignId('new_enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            $table->string('action'); $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rolled_back_at')->nullable(); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_histories'); Schema::dropIfExists('student_transfers');
        if (Schema::hasColumn('parent_teacher_meetings','campus_id')) Schema::table('parent_teacher_meetings', fn(Blueprint $table)=>$table->dropConstrainedForeignId('campus_id'));
        Schema::dropIfExists('class_substitutions');
        Schema::dropIfExists('class_diaries'); Schema::dropIfExists('syllabus_topics');
        Schema::dropIfExists('exam_mark_revisions');
        Schema::table('exams', fn (Blueprint $table) => $table->dropConstrainedForeignId('approved_by'));
        Schema::table('exams', fn (Blueprint $table) => $table->dropColumn(['approval_status','approved_at','locked_at']));
    }
};
