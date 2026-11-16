<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('staff_loans', function (Blueprint $table) {
            $table->decimal('outstanding_balance', 12, 2)->default(0)->after('amount');
            $table->timestamp('settled_at')->nullable()->after('approved_by');
        });
        DB::table('staff_loans')->where('outstanding_balance', 0)->update(['outstanding_balance' => DB::raw('amount')]);

        Schema::table('staff_payrolls', function (Blueprint $table) {
            $table->foreignId('finalized_by')->nullable()->after('finalized_at')->constrained('users')->nullOnDelete();
            $table->timestamp('payslip_emailed_at')->nullable()->after('bank_reference');
        });

        Schema::create('staff_loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('staff_loan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_payroll_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['staff_loan_id', 'staff_payroll_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_loan_repayments');
        Schema::table('staff_payrolls', function (Blueprint $table) {
            $table->dropConstrainedForeignId('finalized_by');
            $table->dropColumn('payslip_emailed_at');
        });
        Schema::table('staff_loans', fn (Blueprint $table) => $table->dropColumn(['outstanding_balance', 'settled_at']));
    }
};
