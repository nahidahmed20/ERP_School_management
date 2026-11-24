<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('recurring_expenses')) {
            Schema::create('recurring_expenses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campus_id')->constrained()->cascadeOnDelete();
                $table->string('expense_head');
                $table->decimal('amount', 12, 2);
                $table->foreignId('expense_account_id')->constrained('accounts')->restrictOnDelete();
                $table->string('frequency', 20);
                $table->date('start_date');
                $table->date('next_due_date')->index();
                $table->unsignedTinyInteger('billing_day')->default(1);
                $table->unsignedTinyInteger('billing_month')->nullable();
                $table->date('end_date')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->index(['campus_id', 'next_due_date', 'is_active'], 'recurring_expenses_due_idx');
            });
        }

        $expenseColumns = [
            'expense_account_id' => fn (Blueprint $table) => $table->foreignId('expense_account_id')->nullable()->after('campus_id')->constrained('accounts')->nullOnDelete(),
            'payment_account_id' => fn (Blueprint $table) => $table->foreignId('payment_account_id')->nullable()->after('expense_account_id')->constrained('accounts')->nullOnDelete(),
            'status' => fn (Blueprint $table) => $table->string('status', 20)->default('paid')->index()->after('amount'),
            'paid_at' => fn (Blueprint $table) => $table->timestamp('paid_at')->nullable()->after('expense_date'),
            'voided_at' => fn (Blueprint $table) => $table->timestamp('voided_at')->nullable(),
            'recurring_expense_id' => fn (Blueprint $table) => $table->foreignId('recurring_expense_id')->nullable()->after('voided_at')->constrained('recurring_expenses')->nullOnDelete(),
            'occurrence_date' => fn (Blueprint $table) => $table->date('occurrence_date')->nullable(),
            'created_by' => fn (Blueprint $table) => $table->foreignId('created_by')->nullable()->after('recorded_by')->constrained('users')->nullOnDelete(),
        ];
        foreach ($expenseColumns as $column => $definition) {
            if (! Schema::hasColumn('expenses', $column)) Schema::table('expenses', $definition);
        }
        if (! collect(Schema::getIndexes('expenses'))->contains(fn ($index) => ($index['name'] ?? null) === 'expenses_recurring_occurrence_unique')) {
            Schema::table('expenses', fn (Blueprint $table) => $table->unique(['recurring_expense_id', 'occurrence_date'], 'expenses_recurring_occurrence_unique'));
        }

        if (! Schema::hasColumn('staff_payrolls', 'payment_account_id')) {
            Schema::table('staff_payrolls', fn (Blueprint $table) => $table->foreignId('payment_account_id')->nullable()->after('payment_method')->constrained('accounts')->nullOnDelete());
        }
        if (! Schema::hasColumn('staff_loans', 'campus_id')) {
            Schema::table('staff_loans', fn (Blueprint $table) => $table->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete());
        }
        $staffLoanColumns = [
            'payment_account_id' => fn (Blueprint $table) => $table->foreignId('payment_account_id')->nullable()->after('outstanding_balance')->constrained('accounts')->nullOnDelete(),
            'disbursed_at' => fn (Blueprint $table) => $table->date('disbursed_at')->nullable()->after('payment_account_id'),
        ];
        foreach ($staffLoanColumns as $column => $definition) {
            if (! Schema::hasColumn('staff_loans', $column)) Schema::table('staff_loans', $definition);
        }
        DB::table('staff_loans')->join('staff', 'staff.id', '=', 'staff_loans.staff_id')
            ->whereNull('staff_loans.campus_id')->update(['staff_loans.campus_id' => DB::raw('staff.campus_id')]);
        $linkedColumns = [
            'hostel_fees' => ['payment_account_id' => fn (Blueprint $table) => $table->foreignId('payment_account_id')->nullable()->after('payment_date')->constrained('accounts')->nullOnDelete()],
            'library_fine_payments' => ['payment_account_id' => fn (Blueprint $table) => $table->foreignId('payment_account_id')->nullable()->after('received_by')->constrained('accounts')->nullOnDelete()],
            'asset_maintenances' => ['general_expense_id' => fn (Blueprint $table) => $table->foreignId('general_expense_id')->nullable()->after('cost')->constrained('expenses')->nullOnDelete()],
            'vehicle_expenses' => ['general_expense_id' => fn (Blueprint $table) => $table->foreignId('general_expense_id')->nullable()->after('recorded_by')->constrained('expenses')->nullOnDelete()],
            'vehicle_fuel_logs' => ['general_expense_id' => fn (Blueprint $table) => $table->foreignId('general_expense_id')->nullable()->after('recorded_by')->constrained('expenses')->nullOnDelete()],
            'vehicle_maintenance_logs' => ['general_expense_id' => fn (Blueprint $table) => $table->foreignId('general_expense_id')->nullable()->after('cost')->constrained('expenses')->nullOnDelete()],
        ];
        foreach ($linkedColumns as $tableName => $columns) {
            foreach ($columns as $column => $definition) {
                if (! Schema::hasColumn($tableName, $column)) Schema::table($tableName, $definition);
            }
        }

        $campuses = DB::table('campuses')->orderBy('id')->pluck('id');
        $mainCampusId = DB::table('campuses')->where('is_main', true)->value('id') ?? $campuses->first();
        if ($mainCampusId) {
            DB::table('expenses')->whereNull('campus_id')->update(['campus_id' => $mainCampusId]);
        }

        foreach ($campuses as $campusId) {
            $cashId = $this->ensureAccount($campusId, '1000', 'Cash & Bank', 'Asset');
            $expenseId = $this->ensureAccount($campusId, '5200', 'General Operating Expenses', 'Expense');
            $payableId = $this->ensureAccount($campusId, '2000', 'Accounts Payable', 'Liability');
            $incomeId = $this->ensureAccount($campusId, '4000', 'Fee Income', 'Income');
            $loanReceivableId = $this->ensureAccount($campusId, '1300', 'Staff Loan Receivable', 'Asset');

            DB::table('staff_loans')->where('campus_id', $campusId)->whereIn('status', ['Approved', 'Completed'])
                ->whereNull('payment_account_id')->orderBy('id')->chunkById(250, function ($rows) use ($campusId, $cashId, $loanReceivableId) {
                    foreach ($rows as $loan) {
                        $date = substr((string) ($loan->created_at ?? now()), 0, 10);
                        DB::table('staff_loans')->where('id', $loan->id)->update([
                            'payment_account_id' => $cashId, 'disbursed_at' => $date,
                        ]);
                        $sourceKey = 'staff-loan:'.$loan->id;
                        if (DB::table('journal_entries')->where('source_key', $sourceKey)->exists()) continue;
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-STAFF-LOAN-'.$loan->id,
                            'date' => $date, 'voucher_type' => 'Payment', 'debit_account_id' => $loanReceivableId,
                            'credit_account_id' => $cashId, 'amount' => $loan->amount,
                            'description' => 'Historical staff '.$loan->loan_type.' disbursement #'.$loan->id,
                            'source_type' => App\Models\StaffLoan::class, 'source_id' => $loan->id,
                            'source_key' => $sourceKey, 'created_by' => $loan->approved_by,
                            'created_at' => $loan->created_at ?? now(), 'updated_at' => now(),
                        ]);
                    }
                });

            DB::table('hostel_fees')->join('students', 'students.id', '=', 'hostel_fees.student_id')
                ->where('students.campus_id', $campusId)->where('hostel_fees.status', 'Paid')
                ->whereNull('hostel_fees.payment_account_id')->select('hostel_fees.*')->orderBy('hostel_fees.id')
                ->chunkById(250, function ($rows) use ($campusId, $cashId, $incomeId) {
                    foreach ($rows as $fee) {
                        $date = substr((string) ($fee->payment_date ?? $fee->updated_at ?? now()), 0, 10);
                        DB::table('hostel_fees')->where('id', $fee->id)->update(['payment_account_id' => $cashId]);
                        $sourceKey = 'hostel-fee:'.$fee->id;
                        if (DB::table('journal_entries')->where('source_key', $sourceKey)->exists()) continue;
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-HOSTEL-FEE-'.$fee->id,
                            'date' => $date, 'voucher_type' => 'Receipt', 'debit_account_id' => $cashId,
                            'credit_account_id' => $incomeId, 'amount' => $fee->amount,
                            'description' => 'Historical hostel fee '.$fee->month.' '.$fee->year,
                            'source_type' => App\Models\HostelFee::class, 'source_id' => $fee->id, 'source_key' => $sourceKey,
                            'created_at' => $fee->created_at ?? now(), 'updated_at' => now(),
                        ]);
                    }
                }, 'hostel_fees.id');

            DB::table('library_fine_payments')->join('book_issues', 'book_issues.id', '=', 'library_fine_payments.book_issue_id')
                ->join('students', 'students.user_id', '=', 'book_issues.user_id')->where('students.campus_id', $campusId)
                ->whereNull('library_fine_payments.payment_account_id')->select('library_fine_payments.*')
                ->orderBy('library_fine_payments.id')->chunkById(250, function ($rows) use ($campusId, $cashId, $incomeId) {
                    foreach ($rows as $fine) {
                        $sourceKey = 'library-fine:'.$fine->id;
                        DB::table('library_fine_payments')->where('id', $fine->id)->update(['payment_account_id' => $cashId]);
                        if (DB::table('journal_entries')->where('source_key', $sourceKey)->exists()) continue;
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-LIB-FINE-'.$fine->id,
                            'date' => substr((string) ($fine->paid_at ?? $fine->created_at ?? now()), 0, 10), 'voucher_type' => 'Receipt',
                            'debit_account_id' => $cashId, 'credit_account_id' => $incomeId, 'amount' => $fine->amount,
                            'description' => 'Historical library fine payment #'.$fine->id,
                            'source_type' => App\Models\LibraryFinePayment::class, 'source_id' => $fine->id, 'source_key' => $sourceKey,
                            'created_by' => $fine->received_by, 'created_at' => $fine->created_at ?? now(), 'updated_at' => now(),
                        ]);
                    }
                }, 'library_fine_payments.id');

            DB::table('asset_maintenances')->join('assets', 'assets.id', '=', 'asset_maintenances.asset_id')
                ->where('assets.campus_id', $campusId)->where('asset_maintenances.status', 'Completed')
                ->where('asset_maintenances.cost', '>', 0)->whereNull('asset_maintenances.general_expense_id')
                ->select('asset_maintenances.*')->orderBy('asset_maintenances.id')
                ->chunkById(250, function ($rows) use ($campusId, $expenseId, $payableId, $cashId) {
                    foreach ($rows as $maintenance) {
                        $date = substr((string) ($maintenance->end_date ?? $maintenance->start_date ?? $maintenance->created_at ?? now()), 0, 10);
                        $generalExpenseId = $this->insertHistoricalTransportExpense($campusId, $expenseId, $payableId, $cashId, 'Asset maintenance: '.$maintenance->title, $maintenance->cost, $date, 'Historical asset maintenance #'.$maintenance->id.($maintenance->details ? ': '.$maintenance->details : ''), null);
                        DB::table('asset_maintenances')->where('id', $maintenance->id)->update(['general_expense_id' => $generalExpenseId]);
                    }
                }, 'asset_maintenances.id');

            // Historical ledger expenses were recorded as already-paid cash expenses.
            // Preserve them in the double-entry ledger so opening reports reconcile.
            DB::table('expenses')->where('campus_id', $campusId)->whereNull('expense_account_id')->orderBy('id')->chunkById(250, function ($expenses) use ($campusId, $cashId, $expenseId) {
                foreach ($expenses as $expense) {
                    $sourceKey = 'expense:'.$expense->id.':recognition';
                    DB::table('expenses')->where('id', $expense->id)->update([
                        'expense_account_id' => $expenseId,
                        'payment_account_id' => $cashId,
                        'status' => 'paid',
                        'paid_at' => $expense->expense_date.' 00:00:00',
                    ]);

                    if (DB::table('journal_entries')->where('source_key', $sourceKey)->exists()) continue;
                    DB::table('journal_entries')->insert([
                        'campus_id' => $campusId,
                        'voucher_no' => 'LEGACY-EXP-'.$expense->id,
                        'date' => $expense->expense_date,
                        'voucher_type' => 'Payment',
                        'debit_account_id' => $expenseId,
                        'credit_account_id' => $cashId,
                        'amount' => $expense->amount,
                        'description' => 'Legacy expense: '.$expense->expense_head,
                        'created_by' => is_numeric($expense->recorded_by) ? (int) $expense->recorded_by : null,
                        'source_type' => App\Models\Expense::class,
                        'source_id' => $expense->id,
                        'source_key' => $sourceKey,
                        'created_at' => $expense->created_at ?? now(),
                        'updated_at' => now(),
                    ]);
                }
            });

            DB::table('vehicle_expenses')->join('vehicles', 'vehicles.id', '=', 'vehicle_expenses.vehicle_id')
                ->where('vehicles.campus_id', $campusId)->whereNull('vehicle_expenses.general_expense_id')
                ->select('vehicle_expenses.*')->orderBy('vehicle_expenses.id')->chunkById(250, function ($rows) use ($campusId, $expenseId, $payableId, $cashId) {
                    foreach ($rows as $vehicleExpense) {
                        $ledgerId = DB::table('expenses')->insertGetId([
                            'campus_id' => $campusId, 'expense_head' => 'Transport - '.$vehicleExpense->category,
                            'amount' => $vehicleExpense->amount, 'status' => 'paid', 'expense_date' => $vehicleExpense->date,
                            'description' => 'Historical vehicle expense #'.$vehicleExpense->id.($vehicleExpense->notes ? ': '.$vehicleExpense->notes : ''),
                            'expense_account_id' => $expenseId, 'payment_account_id' => $cashId, 'paid_at' => $vehicleExpense->date.' 00:00:00', 'recorded_by' => $vehicleExpense->recorded_by,
                            'created_by' => is_numeric($vehicleExpense->recorded_by) ? (int) $vehicleExpense->recorded_by : null,
                            'created_at' => $vehicleExpense->created_at ?? now(), 'updated_at' => now(),
                        ]);
                        DB::table('vehicle_expenses')->where('id', $vehicleExpense->id)->update(['general_expense_id' => $ledgerId]);
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-VEH-EXP-'.$vehicleExpense->id,
                            'date' => $vehicleExpense->date, 'voucher_type' => 'Journal',
                            'debit_account_id' => $expenseId, 'credit_account_id' => $payableId, 'amount' => $vehicleExpense->amount,
                            'description' => 'Historical vehicle expense: '.$vehicleExpense->category,
                            'created_by' => is_numeric($vehicleExpense->recorded_by) ? (int) $vehicleExpense->recorded_by : null,
                            'source_type' => App\Models\Expense::class, 'source_id' => $ledgerId,
                            'source_key' => 'expense:'.$ledgerId.':recognition',
                            'created_at' => $vehicleExpense->created_at ?? now(), 'updated_at' => now(),
                        ]);
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-VEH-PAY-'.$vehicleExpense->id,
                            'date' => $vehicleExpense->date, 'voucher_type' => 'Payment',
                            'debit_account_id' => $payableId, 'credit_account_id' => $cashId, 'amount' => $vehicleExpense->amount,
                            'description' => 'Historical vehicle expense payment: '.$vehicleExpense->category,
                            'created_by' => is_numeric($vehicleExpense->recorded_by) ? (int) $vehicleExpense->recorded_by : null,
                            'source_type' => App\Models\Expense::class, 'source_id' => $ledgerId,
                            'source_key' => 'expense:'.$ledgerId.':payment',
                            'created_at' => $vehicleExpense->created_at ?? now(), 'updated_at' => now(),
                        ]);
                    }
                }, 'vehicle_expenses.id');

            DB::table('vehicle_fuel_logs')->join('vehicles', 'vehicles.id', '=', 'vehicle_fuel_logs.vehicle_id')
                ->where('vehicles.campus_id', $campusId)->whereNull('vehicle_fuel_logs.general_expense_id')
                ->select('vehicle_fuel_logs.*')->orderBy('vehicle_fuel_logs.id')->chunkById(250, function ($rows) use ($campusId, $expenseId, $payableId, $cashId) {
                    foreach ($rows as $fuel) {
                        $amount = round((float) $fuel->litres * (float) $fuel->unit_price, 2);
                        if ($amount <= 0) continue;
                        $id = $this->insertHistoricalTransportExpense($campusId, $expenseId, $payableId, $cashId, 'Transport - Fuel', $amount, $fuel->date, 'Historical fuel log #'.$fuel->id, $fuel->recorded_by);
                        DB::table('vehicle_fuel_logs')->where('id', $fuel->id)->update(['general_expense_id' => $id]);
                    }
                }, 'vehicle_fuel_logs.id');

            DB::table('vehicle_maintenance_logs')->join('vehicles', 'vehicles.id', '=', 'vehicle_maintenance_logs.vehicle_id')
                ->where('vehicles.campus_id', $campusId)->whereNull('vehicle_maintenance_logs.general_expense_id')
                ->where('vehicle_maintenance_logs.status', 'completed')->where('vehicle_maintenance_logs.cost', '>', 0)
                ->select('vehicle_maintenance_logs.*')->orderBy('vehicle_maintenance_logs.id')->chunkById(250, function ($rows) use ($campusId, $expenseId, $payableId, $cashId) {
                    foreach ($rows as $maintenance) {
                        $date = $maintenance->service_date ?: substr((string) ($maintenance->created_at ?? now()), 0, 10);
                        $description = 'Historical maintenance log #'.$maintenance->id.($maintenance->notes ? ': '.$maintenance->notes : '');
                        $id = $this->insertHistoricalTransportExpense($campusId, $expenseId, $payableId, $cashId, 'Transport - Maintenance: '.$maintenance->type, $maintenance->cost, $date, $description, $maintenance->recorded_by ?? null);
                        DB::table('vehicle_maintenance_logs')->where('id', $maintenance->id)->update(['general_expense_id' => $id]);
                    }
                }, 'vehicle_maintenance_logs.id');

            DB::table('transport_fee_charges')->join('transport_allocations', 'transport_allocations.id', '=', 'transport_fee_charges.transport_allocation_id')
                ->where('transport_allocations.campus_id', $campusId)->where('transport_fee_charges.status', 'paid')
                ->select('transport_fee_charges.*')
                ->orderBy('transport_fee_charges.id')->chunkById(250, function ($rows) use ($campusId, $cashId, $incomeId) {
                    foreach ($rows as $fee) {
                        if (DB::table('journal_entries')->where('source_key', 'transport-fee:'.$fee->id)->exists()) continue;
                        DB::table('journal_entries')->insert([
                            'campus_id' => $campusId, 'voucher_no' => 'LEGACY-TRF-'.$fee->id,
                            'date' => substr((string) ($fee->paid_at ?? $fee->updated_at ?? now()), 0, 10), 'voucher_type' => 'Receipt',
                            'debit_account_id' => $cashId, 'credit_account_id' => $incomeId, 'amount' => $fee->amount,
                            'description' => 'Historical transport fee '.$fee->billing_month,
                            'source_type' => App\Models\TransportFeeCharge::class, 'source_id' => $fee->id,
                            'source_key' => 'transport-fee:'.$fee->id, 'created_at' => $fee->created_at ?? now(), 'updated_at' => now(),
                        ]);
                    }
                }, 'transport_fee_charges.id');
        }
    }

    public function down(): void
    {
        Schema::table('staff_payrolls', fn (Blueprint $table) => $table->dropConstrainedForeignId('payment_account_id'));
        Schema::table('staff_loans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('campus_id');
            $table->dropConstrainedForeignId('payment_account_id');
            $table->dropColumn('disbursed_at');
        });
        Schema::table('asset_maintenances', fn (Blueprint $table) => $table->dropConstrainedForeignId('general_expense_id'));
        Schema::table('library_fine_payments', fn (Blueprint $table) => $table->dropConstrainedForeignId('payment_account_id'));
        Schema::table('hostel_fees', fn (Blueprint $table) => $table->dropConstrainedForeignId('payment_account_id'));
        Schema::table('vehicle_maintenance_logs', fn (Blueprint $table) => $table->dropConstrainedForeignId('general_expense_id'));
        Schema::table('vehicle_fuel_logs', fn (Blueprint $table) => $table->dropConstrainedForeignId('general_expense_id'));
        Schema::table('vehicle_expenses', fn (Blueprint $table) => $table->dropConstrainedForeignId('general_expense_id'));
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropUnique('expenses_recurring_occurrence_unique');
            $table->dropConstrainedForeignId('created_by');
            $table->dropConstrainedForeignId('recurring_expense_id');
            $table->dropConstrainedForeignId('payment_account_id');
            $table->dropConstrainedForeignId('expense_account_id');
            $table->dropColumn(['status', 'paid_at', 'voided_at', 'occurrence_date']);
        });
        Schema::dropIfExists('recurring_expenses');
    }

    private function ensureAccount(int $campusId, string $code, string $name, string $type): int
    {
        $account = DB::table('accounts')->where('campus_id', $campusId)->where('code', $code)->first();
        if ($account) {
            if ($account->type !== $type) {
                throw new RuntimeException("Account code {$code} must have type {$type} for finance backfill.");
            }
            return (int) $account->id;
        }

        return (int) DB::table('accounts')->insertGetId([
            'campus_id' => $campusId,
            'name' => $name,
            'code' => $code,
            'type' => $type,
            'opening_balance' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function insertHistoricalTransportExpense(int $campusId, int $expenseAccountId, int $payableId, int $cashId, string $head, float|string $amount, string $date, string $description, ?int $recordedBy): int
    {
        $id = DB::table('expenses')->insertGetId([
            'campus_id' => $campusId, 'expense_head' => $head, 'amount' => $amount,
            'status' => 'paid', 'expense_date' => $date, 'paid_at' => $date.' 00:00:00',
            'description' => $description, 'expense_account_id' => $expenseAccountId,
            'payment_account_id' => $cashId, 'recorded_by' => $recordedBy ? (string) $recordedBy : null,
            'created_by' => $recordedBy, 'created_at' => now(), 'updated_at' => now(),
        ]);
        foreach ([['recognition', $expenseAccountId, $payableId, 'Journal'], ['payment', $payableId, $cashId, 'Payment']] as [$suffix, $debit, $credit, $type]) {
            DB::table('journal_entries')->insert([
                'campus_id' => $campusId, 'voucher_no' => 'LEGACY-TRANS-'.$id.'-'.$suffix,
                'date' => $date, 'voucher_type' => $type, 'debit_account_id' => $debit,
                'credit_account_id' => $credit, 'amount' => $amount, 'description' => $description,
                'created_by' => $recordedBy, 'source_type' => App\Models\Expense::class, 'source_id' => $id,
                'source_key' => 'expense:'.$id.':'.$suffix, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        return $id;
    }
};
