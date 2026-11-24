<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class ExpenseAccountingService
{
    public function sync(Expense $expense): void
    {
        $accounting = app(AccountingService::class);
        $accounting->reverseSource($expense);

        if ($expense->status === 'void') return;

        $campusId = (int) $expense->campus_id;
        $expenseAccount = $this->account($expense->expense_account_id, $campusId, 'Expense');
        $payableAccount = $accounting->accountForCode('2000', $campusId);

        $accounting->post(
            "expense:{$expense->id}:recognition",
            $expense,
            $expenseAccount,
            $payableAccount,
            (float) $expense->amount,
            'Expense: '.$expense->expense_head,
            $expense->expense_date?->toDateString() ?? (string) $expense->expense_date,
            'Journal'
        );

        if ($expense->status === 'paid') {
            $paymentAccount = $this->account($expense->payment_account_id, $campusId, 'Asset');
            $accounting->post(
                "expense:{$expense->id}:payment",
                $expense,
                $payableAccount,
                $paymentAccount,
                (float) $expense->amount,
                'Payment for expense: '.$expense->expense_head,
                $expense->paid_at?->toDateString() ?? $expense->expense_date?->toDateString() ?? (string) $expense->expense_date,
                'Payment'
            );
        }
    }

    public function pay(Expense $expense, int $accountId, string $date): Expense
    {
        return DB::transaction(function () use ($expense, $accountId, $date) {
            $expense = Expense::whereKey($expense->id)->lockForUpdate()->firstOrFail();
            abort_unless($expense->status === 'unpaid', 422, 'Only unpaid expenses can be paid.');
            $this->account($accountId, (int) $expense->campus_id, 'Asset');
            $expense->update(['status' => 'paid', 'payment_account_id' => $accountId, 'paid_at' => $date]);
            $this->sync($expense->fresh());

            return $expense->fresh(['expenseAccount', 'paymentAccount']);
        }, 3);
    }

    private function account(?int $accountId, int $campusId, string $type): Account
    {
        abort_if(! $accountId || ! $campusId, 422, 'Select an active accounting account and campus.');
        return Account::withoutGlobalScopes()->whereKey($accountId)
            ->where('campus_id', $campusId)->where('type', $type)->where('is_active', true)->firstOrFail();
    }
}
