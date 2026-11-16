<?php

namespace App\Services;

use App\Models\FeeAssignment;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FeeAutomationService
{
    public function generate(Carbon $date, ?int $campusId = null): array
    {
        $totals = ['created' => 0, 'skipped' => 0];
        FeeAssignment::withoutGlobalScopes()
            ->where('is_active', true)->whereDate('next_invoice_date', '<=', $date)
            ->when($campusId, fn ($query) => $query->where('campus_id', $campusId))
            ->chunkById(100, function ($assignments) use ($date, &$totals) {
                foreach ($assignments as $assignment) {
                    foreach ($this->generateAssignment($assignment->id, $date) as $key => $count) {
                        $totals[$key] += $count;
                    }
                }
            });

        return $totals;
    }

    public function generateAssignment(int $assignmentId, Carbon $date): array
    {
        return DB::transaction(function () use ($assignmentId, $date) {
            $assignment = FeeAssignment::withoutGlobalScopes()->with('feeGroup.feeTypes')
                ->whereKey($assignmentId)->lockForUpdate()->firstOrFail();
            $totals = ['created' => 0, 'skipped' => 0];

            while ($assignment->is_active && $assignment->next_invoice_date && $assignment->next_invoice_date->lte($date)) {
                $periodStart = $assignment->next_invoice_date->copy();
                if ($assignment->ends_on && $periodStart->gt($assignment->ends_on)) {
                    $assignment->update(['is_active' => false]);
                    break;
                }

                $next = match ($assignment->billing_frequency) {
                    'monthly' => $periodStart->copy()->addMonthNoOverflow(),
                    'quarterly' => $periodStart->copy()->addMonthsNoOverflow(3),
                    'yearly' => $periodStart->copy()->addYearNoOverflow(),
                    default => null,
                };
                if ($next && $assignment->starts_on) {
                    $next->day(min($assignment->starts_on->day, $next->daysInMonth));
                }
                $base = (float) ($assignment->amount ?? $assignment->feeGroup?->feeTypes->where('is_active', true)->sum('amount') ?? 0);
                $discount = match ($assignment->discount_type) {
                    'fixed' => min($base, (float) $assignment->discount_value),
                    'percentage' => min($base, $base * min(100, (float) $assignment->discount_value) / 100),
                    default => 0,
                };
                $invoice = Invoice::withoutGlobalScopes()->firstOrCreate([
                    'generation_key' => "fee:{$assignment->id}:{$periodStart->format('Y-m-d')}",
                ], [
                    'campus_id' => $assignment->campus_id,
                    'student_id' => $assignment->student_id,
                    'fee_group_id' => $assignment->fee_group_id,
                    'fee_assignment_id' => $assignment->id,
                    'invoice_no' => 'INV-'.$periodStart->format('Ymd').'-'.$assignment->id,
                    'invoice_date' => $periodStart,
                    'due_date' => $periodStart->copy()->addDays($assignment->grace_days),
                    'period_start' => $periodStart,
                    'period_end' => $next ? $next->copy()->subDay() : $periodStart,
                    'amount' => $base,
                    'discount' => round($discount, 2),
                    'late_fee_rate' => $assignment->late_fee_value,
                    'status' => $base - round($discount, 2) <= 0 ? 'Paid' : 'Unpaid',
                ]);
                $totals[$invoice->wasRecentlyCreated ? 'created' : 'skipped']++;
                $assignment->update([
                    'next_invoice_date' => $next,
                    'is_active' => $next !== null && (! $assignment->ends_on || $next->lte($assignment->ends_on)),
                ]);
            }

            if ($assignment->invoices()->withoutGlobalScopes()->exists()) {
                app(FeePaymentService::class)->syncAssignment($assignment->id);
            }

            return $totals;
        }, 3);
    }

    public function applyLateFines(Carbon $date): int
    {
        $updated = 0;
        Invoice::withoutGlobalScopes()->whereIn('status', ['Unpaid', 'Partial'])
            ->whereDate('due_date', '<', $date)->whereNull('fine_applied_at')
            ->chunkById(100, function ($invoices) use (&$updated) {
                foreach ($invoices as $candidate) {
                    $updated += DB::transaction(function () use ($candidate) {
                        $invoice = Invoice::withoutGlobalScopes()->whereKey($candidate->id)->lockForUpdate()->firstOrFail();
                        if ($invoice->fine_applied_at || ! in_array($invoice->status, ['Unpaid', 'Partial'], true)) {
                            return 0;
                        }
                        $assignment = FeeAssignment::withoutGlobalScopes()->find($invoice->fee_assignment_id);
                        if (! $assignment || $assignment->late_fee_type === 'none') {
                            $invoice->update(['fine_applied_at' => now()]);
                            return 0;
                        }
                        $fine = $assignment->late_fee_type === 'percentage'
                            ? max(0, (float) $invoice->amount - (float) $invoice->discount) * min(100, (float) $assignment->late_fee_value) / 100
                            : (float) $assignment->late_fee_value;
                        $invoice->update(['fine' => round($fine, 2), 'fine_applied_at' => now()]);
                        return 1;
                    }, 3);
                }
            });

        return $updated;
    }
}
