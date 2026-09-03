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
        $created = 0; $skipped = 0;
        FeeAssignment::withoutGlobalScopes()->with('feeGroup.feeTypes')
            ->where('is_active', true)->whereDate('next_invoice_date', '<=', $date)
            ->when($campusId, fn ($query) => $query->where('campus_id', $campusId))
            ->orderBy('id')->chunkById(100, function ($assignments) use ($date, &$created, &$skipped) {
                foreach ($assignments as $assignment) {
                    DB::transaction(function () use ($assignment, $date, &$created, &$skipped) {
                        $assignment->lockForUpdate()->refresh();
                        if (! $assignment->is_active || ! $assignment->next_invoice_date || $assignment->next_invoice_date->gt($date)) { $skipped++; return; }
                        $periodStart = $assignment->next_invoice_date->copy();
                        if ($assignment->ends_on && $periodStart->gt($assignment->ends_on)) { $assignment->update(['is_active' => false]); $skipped++; return; }
                        $periodEnd = match ($assignment->billing_frequency) {
                            'monthly' => $periodStart->copy()->endOfMonth(), 'quarterly' => $periodStart->copy()->addMonths(3)->subDay(),
                            'yearly' => $periodStart->copy()->addYear()->subDay(), default => $periodStart->copy(),
                        };
                        $base = (float) ($assignment->amount ?? $assignment->feeGroup->feeTypes->where('is_active', true)->sum('amount'));
                        $discount = match ($assignment->discount_type) {
                            'fixed' => min($base, (float) $assignment->discount_value),
                            'percentage' => min($base, $base * min(100, (float) $assignment->discount_value) / 100), default => 0,
                        };
                        $key = "fee:{$assignment->id}:{$periodStart->format('Y-m-d')}";
                        $invoice = Invoice::withoutGlobalScopes()->firstOrCreate(['generation_key' => $key], [
                            'campus_id' => $assignment->campus_id, 'student_id' => $assignment->student_id,
                            'fee_group_id' => $assignment->fee_group_id, 'fee_assignment_id' => $assignment->id,
                            'invoice_no' => 'INV-'.$periodStart->format('Ym').'-'.$assignment->id,
                            'invoice_date' => $date, 'due_date' => $periodStart->copy()->addDays($assignment->grace_days),
                            'period_start' => $periodStart, 'period_end' => $periodEnd,
                            'amount' => $base, 'discount' => round($discount, 2), 'late_fee_rate' => $assignment->late_fee_value,
                            'status' => 'Unpaid',
                        ]);
                        $invoice->wasRecentlyCreated ? $created++ : $skipped++;
                        $next = match ($assignment->billing_frequency) { 'monthly' => $periodStart->addMonthNoOverflow(), 'quarterly' => $periodStart->addMonthsNoOverflow(3), 'yearly' => $periodStart->addYearNoOverflow(), default => null };
                        $assignment->update(['next_invoice_date' => $next, 'is_active' => $next !== null && (! $assignment->ends_on || $next->lte($assignment->ends_on))]);
                    });
                }
            });
        return compact('created', 'skipped');
    }

    public function applyLateFines(Carbon $date): int
    {
        $updated = 0;
        Invoice::withoutGlobalScopes()->whereIn('status', ['Unpaid', 'Partial'])->whereDate('due_date', '<', $date)->whereNull('fine_applied_at')->chunkById(100, function ($invoices) use (&$updated) {
            foreach ($invoices as $invoice) {
                $assignment = $invoice->feeAssignment;
                if (! $assignment || $assignment->late_fee_type === 'none') { $invoice->update(['fine_applied_at' => now()]); continue; }
                $fine = $assignment->late_fee_type === 'percentage' ? ((float) $invoice->amount - (float) $invoice->discount) * min(100, (float) $assignment->late_fee_value) / 100 : (float) $assignment->late_fee_value;
                $invoice->update(['fine' => round($fine, 2), 'fine_applied_at' => now()]); $updated++;
            }
        });
        return $updated;
    }
}
