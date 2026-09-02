<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntry;

class AccountingService
{
    public function post(
        string $sourceKey,
        object $source,
        string $debitCode,
        string $creditCode,
        float $amount,
        string $description,
        ?string $date = null,
        string $voucherType = 'Journal'
    ): ?JournalEntry {
        if ($amount <= 0) return null;

        $debit = $this->account($debitCode);
        $credit = $this->account($creditCode);

        return JournalEntry::updateOrCreate(
            ['source_key' => $sourceKey],
            [
                'campus_id' => $source->campus_id ?? session('active_campus_id'),
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

    private function account(string $code): Account
    {
        $defaults = [
            '1000' => ['Cash & Bank', 'Asset'],
            '1100' => ['Accounts Receivable', 'Asset'],
            '1200' => ['Inventory', 'Asset'],
            '2000' => ['Accounts Payable', 'Liability'],
            '4000' => ['Fee Income', 'Income'],
            '4100' => ['Sales Income', 'Income'],
            '5000' => ['Cost of Goods Sold', 'Expense'],
        ];
        [$name, $type] = $defaults[$code];

        return Account::firstOrCreate(['code' => $code], [
            'name' => $name,
            'type' => $type,
            'is_active' => true,
        ]);
    }
}
