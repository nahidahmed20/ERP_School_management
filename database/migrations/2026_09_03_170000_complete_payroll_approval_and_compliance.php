<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('bank_name')->nullable(); $table->string('bank_account_name')->nullable(); $table->string('bank_account_number')->nullable(); $table->string('bank_routing_number')->nullable();
            $table->decimal('provident_fund_rate', 5, 2)->default(0); $table->decimal('tax_rate', 5, 2)->default(0); $table->date('contract_end_date')->nullable()->index();
        });
        Schema::table('staff_payrolls', function (Blueprint $table) {
            $table->decimal('bonus', 12, 2)->default(0); $table->decimal('arrears', 12, 2)->default(0); $table->decimal('provident_fund', 12, 2)->default(0); $table->decimal('tax_deduction', 12, 2)->default(0); $table->decimal('gratuity_provision', 12, 2)->default(0);
            $table->enum('approval_status', ['draft', 'approved', 'finalized'])->default('draft')->index(); $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamp('approved_at')->nullable(); $table->timestamp('finalized_at')->nullable(); $table->string('bank_reference')->nullable();
        });
        Schema::create('staff_salary_increments', function (Blueprint $table) {
            $table->id(); $table->unsignedBigInteger('campus_id')->nullable()->index(); $table->unsignedBigInteger('staff_id')->index(); $table->decimal('old_salary', 12, 2); $table->decimal('new_salary', 12, 2); $table->date('effective_date')->index(); $table->text('reason')->nullable(); $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps();
        });
        Schema::create('staff_final_settlements', function (Blueprint $table) {
            $table->id(); $table->unsignedBigInteger('campus_id')->nullable()->index(); $table->unsignedBigInteger('staff_id')->index(); $table->date('last_working_date'); $table->decimal('salary_due', 12, 2)->default(0); $table->decimal('leave_encashment', 12, 2)->default(0); $table->decimal('gratuity', 12, 2)->default(0); $table->decimal('loan_due', 12, 2)->default(0); $table->decimal('other_adjustment', 12, 2)->default(0); $table->decimal('net_settlement', 12, 2)->default(0); $table->enum('status', ['draft', 'approved', 'paid'])->default('draft'); $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamp('paid_at')->nullable(); $table->text('note')->nullable(); $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('staff_final_settlements'); Schema::dropIfExists('staff_salary_increments');
        Schema::table('staff_payrolls', fn(Blueprint $t) => $t->dropColumn(['bonus','arrears','provident_fund','tax_deduction','gratuity_provision','approval_status','approved_by','approved_at','finalized_at','bank_reference']));
        Schema::table('staff', fn(Blueprint $t) => $t->dropColumn(['bank_name','bank_account_name','bank_account_number','bank_routing_number','provident_fund_rate','tax_rate','contract_end_date']));
    }
};
