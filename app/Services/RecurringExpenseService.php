<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\RecurringExpense;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class RecurringExpenseService
{
    public function generateDue(?int $campusId = null, ?CarbonImmutable $through = null): int
    {
        $through ??= CarbonImmutable::today();
        $query = RecurringExpense::withoutGlobalScopes()->where('is_active', true)
            ->whereDate('next_due_date', '<=', $through->toDateString());
        if ($campusId) $query->where('campus_id', $campusId);

        $generated = 0;
        $query->orderBy('id')->pluck('id')->each(function (int $id) use ($through, &$generated) {
            $generated += DB::transaction(function () use ($id, $through) {
                $template = RecurringExpense::withoutGlobalScopes()->whereKey($id)->lockForUpdate()->first();
                if (! $template || ! $template->is_active) return 0;

                $created = 0;
                $due = CarbonImmutable::parse($template->next_due_date)->startOfDay();
                $start = CarbonImmutable::parse($template->start_date)->startOfDay();
                while ($due->lte($through) && (! $template->end_date || $due->lte(CarbonImmutable::parse($template->end_date)->startOfDay()))) {
                    $expense = Expense::withoutGlobalScopes()->firstOrCreate(
                        ['recurring_expense_id' => $template->id, 'occurrence_date' => $due->toDateString()],
                        [
                            'campus_id' => $template->campus_id,
                            'expense_head' => $template->expense_head,
                            'amount' => $template->amount,
                            'expense_account_id' => $template->expense_account_id,
                            'status' => 'unpaid',
                            'expense_date' => $due->toDateString(),
                            'description' => $template->description,
                            'recorded_by' => $template->created_by,
                            'created_by' => $template->created_by,
                        ]
                    );

                    if ($expense->wasRecentlyCreated) {
                        app(ExpenseAccountingService::class)->sync($expense);
                        $created++;
                    }

                    $due = $this->nextDate($due, $template->frequency, (int) $template->billing_day, $template->billing_month ? (int) $template->billing_month : null, $start);
                }

                $template->update([
                    'next_due_date' => $due->toDateString(),
                    'is_active' => ! $template->end_date || $due->lte(CarbonImmutable::parse($template->end_date)->startOfDay()),
                ]);

                return $created;
            }, 3);
        });

        return $generated;
    }

    private function nextDate(CarbonImmutable $current, string $frequency, int $day, ?int $month, CarbonImmutable $start): CarbonImmutable
    {
        $months = match ($frequency) {
            'quarterly' => 3,
            'yearly' => 12,
            'monthly' => 1,
            default => null,
        };
        if ($frequency === 'daily') return $current->addDay();
        if ($frequency === 'weekly') return $current->addWeek();

        $target = $current->startOfMonth()->addMonthsNoOverflow($months ?? 1);
        if ($frequency === 'yearly' && $month) {
            $target = $target->setMonth($month)->startOfMonth();
        }

        return $target->setDay(min($day ?: $start->day, $target->daysInMonth));
    }
}
