<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('staff_leave_balances', function (Blueprint $table) {
            $table->id(); $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete(); $table->unsignedSmallInteger('year');
            $table->decimal('allocated', 6, 2)->default(0); $table->decimal('used', 6, 2)->default(0); $table->decimal('carried_forward', 6, 2)->default(0);
            $table->timestamps(); $table->unique(['staff_id','leave_type_id','year']);
        });
        Schema::create('staff_shifts', function (Blueprint $table) {
            $table->id(); $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete(); $table->date('shift_date');
            $table->time('starts_at'); $table->time('ends_at'); $table->string('location')->nullable(); $table->text('notes')->nullable(); $table->timestamps();
            $table->unique(['staff_id','shift_date','starts_at']);
        });
        Schema::create('staff_documents', function (Blueprint $table) {
            $table->id(); $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete(); $table->string('type'); $table->string('title');
            $table->string('file_path'); $table->date('expires_at')->nullable(); $table->boolean('is_verified')->default(false); $table->timestamps();
        });
        Schema::create('staff_exit_requests', function (Blueprint $table) {
            $table->id(); $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete(); $table->string('type'); $table->date('last_working_date');
            $table->text('reason'); $table->string('status')->default('pending'); $table->text('clearance_notes')->nullable(); $table->timestamps();
        });
        Schema::create('guardian_messages', function (Blueprint $table) {
            $table->id(); $table->foreignId('guardian_id')->constrained()->cascadeOnDelete(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete(); $table->string('subject'); $table->text('message');
            $table->text('reply')->nullable(); $table->string('status')->default('open'); $table->timestamps();
        });
        Schema::create('parent_teacher_meetings', function (Blueprint $table) {
            $table->id(); $table->foreignId('guardian_id')->constrained()->cascadeOnDelete(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete(); $table->dateTime('requested_at'); $table->string('mode')->default('in_person');
            $table->text('agenda')->nullable(); $table->string('status')->default('pending'); $table->text('notes')->nullable(); $table->timestamps();
        });
        Schema::create('parent_consents', function (Blueprint $table) {
            $table->id(); $table->foreignId('guardian_id')->constrained()->cascadeOnDelete(); $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('consent_type'); $table->string('title'); $table->text('details')->nullable(); $table->boolean('is_granted'); $table->timestamp('responded_at'); $table->timestamps();
        });
        Schema::table('student_leave_requests', function (Blueprint $table) {
            $table->foreignId('guardian_id')->nullable()->after('student_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('student_leave_requests', fn (Blueprint $table) => $table->dropConstrainedForeignId('guardian_id'));
        foreach (['parent_consents','parent_teacher_meetings','guardian_messages','staff_exit_requests','staff_documents','staff_shifts','staff_leave_balances'] as $table) Schema::dropIfExists($table);
    }
};
