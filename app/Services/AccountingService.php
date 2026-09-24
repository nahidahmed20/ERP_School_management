<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntry;

class AccountingService
{
    public function post(
        string $sourceKey,
        object $source,
        string|Account $debitAccount,
        string|Account $creditAccount,
        float $amount,
        string $description,
        ?string $date = null,
        string $voucherType = 'Journal'
    ): ?JournalEntry {
        if ($amount <= 0) return null;

        $campusId = (int) ($source->campus_id ?? config('app.active_campus_id'));
        abort_if(! $campusId, 422, 'Select a campus before posting an accounting entry.');
        abort_if(config('app.active_campus_id') && $campusId !== (int) config('app.active_campus_id'), 422, 'The source record is not in the selected campus.');

        $debit = $this->resolveAccount($debitAccount, $campusId);
        $credit = $this->resolveAccount($creditAccount, $campusId);
        abort_if($debit->id === $credit->id, 422, 'Debit and credit accounts must be different.');

        return JournalEntry::updateOrCreate(
            ['source_key' => $sourceKey],
            [
                'campus_id' => $campusId,
                'voucher_no' => 'AUTO-'.strtoupper(substr(hash('sha256', $sourceKey), 0, 14)),
                'date' => $date ?? now()->toDateString(),
                'voucher_type' => $voucherType,
                'debit_account_id' => $debit->id,
                'credit_account_id' => $credit->id,
                'amount' => round($amount, 2),
                'description' => $description,
                'created_by' => auth()->id(),
                'source_type' => $source::class,
                'source_id' => $source->id,
                'reversed_at' => null,
            ]
        );
    }

    public function reverseSource(object $source): void
    {
        JournalEntry::where('source_type', $source::class)
            ->where('source_id', $source->id)
            ->whereNull('reversed_at')
            ->update(['reversed_at' => now()]);
    }

    public function accountForCode(string $code, ?int $campusId = null): Account
    {
        $campusId ??= (int) config('app.active_campus_id');
        abort_if(! $campusId, 422, 'Select a campus before using an accounting account.');

        $defaults = [
            '1000' => ['Cash & Bank', 'Asset'],
            '1010' => ['Online Payment Clearing', 'Asset'],
            '1100' => ['Accounts Receivable', 'Asset'],
            '1200' => ['Inventory', 'Asset'],
            '1300' => ['Staff Loan Receivable', 'Asset'],
            '2000' => ['Accounts Payable', 'Liability'],
            '2100' => ['Salary Payable', 'Liability'],
            '2200' => ['Provident Fund Payable', 'Liability'],
            '2300' => ['Payroll Tax Payable', 'Liability'],
            '2400' => ['Gratuity Payable', 'Liability'],
            '2500' => ['Cafeteria Wallet Liability', 'Liability'],
            '4000' => ['Fee Income', 'Income'],
            '4100' => ['Sales Income', 'Income'],
            '4200' => ['Cafeteria Income', 'Income'],
            '5000' => ['Cost of Goods Sold', 'Expense'],
            '5100' => ['Salary Expense', 'Expense'],
        ];
        abort_unless(isset($defaults[$code]), 422, 'Unknown system account code.');
        [$name, $type] = $defaults[$code];

        return Account::withoutGlobalScopes()->firstOrCreate(['campus_id' => $campusId, 'code' => $code], [
            'name' => $name,
            'type' => $type,
            'is_active' => true,
        ]);
    }

    private function resolveAccount(string|Account $account, int $campusId): Account
    {
        if (is_string($account)) {
            return $this->accountForCode($account, $campusId);
        }

        $resolved = Account::withoutGlobalScopes()
            ->whereKey($account->id)
            ->where('campus_id', $campusId)
            ->where('is_active', true)
            ->first();

        abort_unless($resolved, 422, 'The selected accounting account is inactive or belongs to another campus.');

        return $resolved;
    }
}
