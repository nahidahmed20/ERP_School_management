<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('staff_attendances', function (Blueprint $table) {
            $table->boolean('salary_paid_override')->default(false)->after('status');
            $table->decimal('overtime_hours', 7, 2)->default(0)->after('out_time');
            $table->decimal('overtime_days', 7, 2)->default(0)->after('overtime_hours');
            $table->text('payroll_note')->nullable()->after('note');
            $table->unique(['staff_id','date']);
        });
        Schema::table('leave_types', fn (Blueprint $table) => $table->boolean('is_paid')->default(true)->after('days_allowed'));
        Schema::table('staff_payrolls', function (Blueprint $table) {
            $table->unsignedSmallInteger('working_days')->default(30); $table->decimal('daily_rate',12,2)->default(0);
            $table->decimal('payable_days',7,2)->default(0); $table->decimal('absent_days',7,2)->default(0); $table->decimal('unpaid_leave_days',7,2)->default(0);
            $table->decimal('absence_deduction',12,2)->default(0); $table->decimal('loan_deduction',12,2)->default(0);
            $table->decimal('overtime_units',8,2)->default(0); $table->string('overtime_mode')->nullable(); $table->decimal('overtime_rate',12,2)->default(0); $table->decimal('overtime_amount',12,2)->default(0);
            $table->json('calculation')->nullable(); $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamp('generated_at')->nullable();
            $table->unique(['staff_id','salary_month']);
        });
    }
    public function down(): void
    {
        Schema::table('staff_payrolls', function (Blueprint $table) { $table->dropUnique(['staff_id','salary_month']); $table->dropConstrainedForeignId('generated_by'); $table->dropColumn(['working_days','daily_rate','payable_days','absent_days','unpaid_leave_days','absence_deduction','loan_deduction','overtime_units','overtime_mode','overtime_rate','overtime_amount','calculation','generated_at']); });
        Schema::table('leave_types', fn (Blueprint $table) => $table->dropColumn('is_paid'));
        Schema::table('staff_attendances', function (Blueprint $table) { $table->dropUnique(['staff_id','date']); $table->dropColumn(['salary_paid_override','overtime_hours','overtime_days','payroll_note']); });
    }
};
