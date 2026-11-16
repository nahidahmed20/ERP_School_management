<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fee_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('campus_id')->nullable()->after('id')->index();
            $table->decimal('amount', 12, 2)->nullable()->after('academic_session_id');
            $table->enum('billing_frequency', ['one_time', 'monthly', 'quarterly', 'yearly'])->default('one_time')->after('amount');
            $table->date('starts_on')->nullable()->after('billing_frequency');
            $table->date('ends_on')->nullable()->after('starts_on');
            $table->date('next_invoice_date')->nullable()->after('ends_on')->index();
            $table->enum('discount_type', ['none', 'fixed', 'percentage'])->default('none')->after('next_invoice_date');
            $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            $table->enum('late_fee_type', ['none', 'fixed', 'percentage'])->default('none')->after('discount_value');
            $table->decimal('late_fee_value', 12, 2)->default(0)->after('late_fee_type');
            $table->unsignedSmallInteger('grace_days')->default(0)->after('late_fee_value');
            $table->boolean('is_active')->default(true)->after('grace_days')->index();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('fee_assignment_id')->nullable()->after('fee_group_id')->index();
            $table->date('period_start')->nullable()->after('due_date');
            $table->date('period_end')->nullable()->after('period_start');
            $table->string('generation_key')->nullable()->after('period_end')->unique();
            $table->decimal('late_fee_rate', 12, 2)->default(0)->after('fine');
            $table->timestamp('fine_applied_at')->nullable()->after('late_fee_rate');
        });

        $mainCampus = DB::table('campuses')->orderByDesc('is_main')->value('id');
        DB::table('fee_assignments')->whereNull('campus_id')->update(['campus_id' => $mainCampus]);
        DB::table('fee_assignments')->whereNull('next_invoice_date')->update([
            'starts_on' => DB::raw('due_date'), 'next_invoice_date' => DB::raw('due_date'),
        ]);
    }

    public function down(): void
    {
        Schema::table('invoices', fn (Blueprint $table) => $table->dropColumn(['fee_assignment_id', 'period_start', 'period_end', 'generation_key', 'late_fee_rate', 'fine_applied_at']));
        Schema::table('fee_assignments', fn (Blueprint $table) => $table->dropColumn(['campus_id', 'amount', 'billing_frequency', 'starts_on', 'ends_on', 'next_invoice_date', 'discount_type', 'discount_value', 'late_fee_type', 'late_fee_value', 'grace_days', 'is_active']));
    }
};
