<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\PaymentTransaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class DashboardFinanceService
{
    public const DUE_EXPRESSION = 'CASE WHEN amount + fine - discount - paid_amount > 0 THEN amount + fine - discount - paid_amount ELSE 0 END';

    public function summary(?int $campusId, Carbon $today): array
    {
        // Start before subtracting months: March 31 must produce February, not March again.
        $monthStart = $today->copy()->startOfMonth();
        $months = collect(range(5, 0))->map(fn (int $ago) => $monthStart->copy()->subMonths($ago));
        $income = $this->aggregatePosted($campusId, 'Income', $today, $months);
        $expense = $this->aggregatePosted($campusId, 'Expense', $today, $months);

        $invoices = $this->forCampus(Invoice::query(), $campusId)
            ->whereIn('status', ['Unpaid', 'Partial'])
            ->selectRaw('COUNT(*) as pending_count, COALESCE(SUM('.self::DUE_EXPRESSION.'), 0) as pending_due')
            ->selectRaw('COALESCE(SUM(CASE WHEN due_date < ? THEN 1 ELSE 0 END), 0) as overdue_count', [$today->toDateString()])
            ->toBase()->first();

        $transactions = $this->forCampus(PaymentTransaction::query(), $campusId)
            ->whereIn('status', ['Pending', 'Failed'])
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) as pending_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'Failed' AND transaction_date >= ? AND transaction_date < ? THEN 1 ELSE 0 END), 0) as failed_today", [$today->toDateString(), $today->copy()->addDay()->toDateString()])
            ->toBase()->first();

        return [
            'today_collection' => (float) $income->today_total,
            'month_collection' => (float) $income->month_total,
            'today_expense' => (float) $expense->today_total,
            'month_expense' => (float) $expense->month_total,
            'pending_dues' => (float) $invoices->pending_due,
            'pending_invoices' => (int) $invoices->pending_count,
            'overdue_invoices' => (int) $invoices->overdue_count,
            'pending_online' => (int) $transactions->pending_count,
            'failed_online' => (int) $transactions->failed_today,
            'trend' => $months->map(fn (Carbon $month, int $index) => [
                'label' => $month->format('M'),
                'income' => (float) $income->{'month_'.$index},
                'expense' => (float) $expense->{'month_'.$index},
            ])->all(),
        ];
    }

    private function aggregatePosted(?int $campusId, string $type, Carbon $today, $months): object
    {
        $tomorrow = $today->copy()->addDay()->toDateString();
        $normal = in_array($type, ['Asset', 'Expense'], true) ? 'debit' : 'credit';
        $opposite = $normal === 'debit' ? 'credit' : 'debit';
        $normalAlias = $normal === 'debit' ? 'debit_account' : 'credit_account';
        $oppositeAlias = $opposite === 'debit' ? 'debit_account' : 'credit_account';
        $query = JournalEntry::query()->whereNull('journal_entries.reversed_at')
            ->leftJoin('accounts as debit_account', 'debit_account.id', '=', 'journal_entries.debit_account_id')
            ->leftJoin('accounts as credit_account', 'credit_account.id', '=', 'journal_entries.credit_account_id')
            ->where('journal_entries.date', '>=', $months->first()->toDateString())
            ->where('journal_entries.date', '<', $today->copy()->startOfMonth()->addMonth()->toDateString());
        if ($campusId) $query->where('journal_entries.campus_id', $campusId);
        else $query->whereRaw('1 = 0');
        $query->selectRaw("COALESCE(SUM(CASE WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$normalAlias}.type = ? THEN journal_entries.amount WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$oppositeAlias}.type = ? THEN -journal_entries.amount ELSE 0 END), 0) as today_total", [$today->toDateString(), $tomorrow, $type, $today->toDateString(), $tomorrow, $type]);
        $query->selectRaw("COALESCE(SUM(CASE WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$normalAlias}.type = ? THEN journal_entries.amount WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$oppositeAlias}.type = ? THEN -journal_entries.amount ELSE 0 END), 0) as month_total", [$today->copy()->startOfMonth()->toDateString(), $tomorrow, $type, $today->copy()->startOfMonth()->toDateString(), $tomorrow, $type]);

        foreach ($months as $index => $month) {
            $query->selectRaw("COALESCE(SUM(CASE WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$normalAlias}.type = ? THEN journal_entries.amount WHEN journal_entries.date >= ? AND journal_entries.date < ? AND {$oppositeAlias}.type = ? THEN -journal_entries.amount ELSE 0 END), 0) as month_{$index}", [$month->toDateString(), $month->copy()->addMonth()->toDateString(), $type, $month->toDateString(), $month->copy()->addMonth()->toDateString(), $type]);
        }

        return $query->toBase()->first();
    }

    public function forCampus(Builder $query, ?int $campusId): Builder
    {
        // A missing campus must never accidentally become an all-campus aggregate.
        return $query->withoutGlobalScope('campus')->when(
            $campusId,
            fn (Builder $query) => $query->where($query->getModel()->qualifyColumn('campus_id'), $campusId),
            fn (Builder $query) => $query->whereRaw('1 = 0'),
        );
    }
}
