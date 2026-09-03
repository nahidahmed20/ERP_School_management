<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('attendance_policies')) Schema::create('attendance_policies', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->default('Default Policy'); $table->time('student_start_time')->default('08:00');
            $table->time('staff_start_time')->default('08:00'); $table->unsignedSmallInteger('late_grace_minutes')->default(15);
            $table->unsignedSmallInteger('half_day_after_minutes')->default(180); $table->json('weekly_holidays')->nullable();
            $table->boolean('block_holiday_entry')->default(true); $table->boolean('auto_absent_sms')->default(false);
            $table->boolean('is_active')->default(true); $table->timestamps();
        });
        if (! Schema::hasTable('attendance_day_locks')) Schema::create('attendance_day_locks', function (Blueprint $table) {
            $table->id(); $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->string('attendance_type'); $table->date('attendance_date'); $table->foreignId('class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete(); $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('locked_at'); $table->timestamps(); $table->unique(['campus_id','attendance_type','attendance_date','class_id','section_id'],'attendance_day_lock_unique');
        });
        if (! Schema::hasColumn('student_attendances','recorded_by')) Schema::table('student_attendances', fn(Blueprint $table) => $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete());
        if (! Schema::hasColumn('student_attendances','verified_at')) Schema::table('student_attendances', fn(Blueprint $table) => $table->timestamp('verified_at')->nullable());
        if (! Schema::hasColumn('staff_attendances','recorded_by')) Schema::table('staff_attendances', fn(Blueprint $table) => $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete());
        if (! Schema::hasColumn('staff_attendances','verified_at')) Schema::table('staff_attendances', fn(Blueprint $table) => $table->timestamp('verified_at')->nullable());
    }
    public function down(): void
    {
        Schema::table('staff_attendances', function(Blueprint $t){$t->dropConstrainedForeignId('recorded_by');$t->dropColumn('verified_at');});
        Schema::table('student_attendances', function(Blueprint $t){$t->dropConstrainedForeignId('recorded_by');$t->dropColumn('verified_at');});
        Schema::dropIfExists('attendance_day_locks'); Schema::dropIfExists('attendance_policies');
    }
};
