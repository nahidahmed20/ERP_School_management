<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\StaffLeave;
use App\Models\StaffLoan;
use App\Models\StaffPayroll;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class PayrollService
{
    public function generate(Staff $staff, string $month, array $options, int $userId): StaffPayroll
    {
        $existing = StaffPayroll::where('staff_id', $staff->id)->where('salary_month', $month)->first();
        if ($existing?->approval_status === 'finalized' || $existing?->status === 'paid') return $existing;
        $start = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $workingDays = (int) ($options['working_days'] ?? 0);
        if ($workingDays < 1 || $workingDays > $start->daysInMonth) {
            throw ValidationException::withMessages(['working_days' => 'Enter the school working-day count for this payroll month.']);
        }
        $basic = round((float) $staff->basic_salary, 2);
        $daily = $workingDays ? $basic / $workingDays : 0;
        $attendances = StaffAttendance::where('staff_id', $staff->id)->whereBetween('date', [$start, $end])->get();
        $absentRows = $attendances->where('status', 'absent')->where('salary_paid_override', false);
        $halfRows = $attendances->where('status', 'half_day')->where('salary_paid_override', false);
        $absent = (float) $absentRows->count();
        $half = (float) $halfRows->count() * .5;
        $unpaidDates = collect();
        StaffLeave::where('staff_id', $staff->id)->where('status', 'approved')->whereHas('leaveType', fn ($q) => $q->where('is_paid', false))
            ->whereDate('start_date', '<=', $end)->whereDate('end_date', '>=', $start)->get()
            ->each(function ($leave) use ($start, $end, $unpaidDates) {
                $from = Carbon::parse($leave->start_date)->max($start);
                $to = Carbon::parse($leave->end_date)->min($end);
                for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
                    if (! $date->isWeekend()) $unpaidDates->push($date->toDateString());
                }
            });
        $unpaidLeave = (float) $unpaidDates->unique()->reject(fn ($date) =>
            $absentRows->contains(fn ($row) => Carbon::parse($row->date)->toDateString() === $date)
            || $halfRows->contains(fn ($row) => Carbon::parse($row->date)->toDateString() === $date)
        )->count();
        $absenceDays = min((float) $workingDays, $absent + $half + $unpaidLeave);
        $absenceDeduction = round($daily * $absenceDays, 2);
        $otEnabled=(bool)($options['overtime_enabled']??false); $mode=$otEnabled?($options['overtime_mode']??'hour'):null;
        $units = $otEnabled ? (float) $attendances->sum($mode === 'day' ? 'overtime_days' : 'overtime_hours') : 0;
        $defaultRate = $mode === 'day' ? $daily : ($daily / 8);
        $multiplier = (float) ($options['overtime_multiplier'] ?? 1.5);
        $otRate = (float) (($options['overtime_rate'] ?? null) ?: $defaultRate) * $multiplier;
        $otAmount = round($units * $otRate, 2);
        $loan = round((float) StaffLoan::where('staff_id', $staff->id)->whereRaw('LOWER(status) = ?', ['approved'])
            ->where('outstanding_balance', '>', 0)->get()->sum(fn ($item) => min((float) $item->monthly_deduction, (float) $item->outstanding_balance)), 2);
        $allowance = round((float) ($options['allowance'] ?? 0), 2);
        $bonus = round((float) ($options['bonus'] ?? 0), 2);
        $arrears = round((float) ($options['arrears'] ?? 0), 2);
        $pf = round($basic * (float) ($options['provident_fund_rate'] ?? $staff->provident_fund_rate ?? 0) / 100, 2);
        $tax = round($basic * (float) ($options['tax_rate'] ?? $staff->tax_rate ?? 0) / 100, 2);
        $gratuity = round($basic * (float) ($options['gratuity_rate'] ?? 0) / 100, 2);
        $manualDeduction = round((float) ($options['deduction'] ?? 0), 2);
        $grossEarnings = round($basic + $allowance + $otAmount + $bonus + $arrears, 2);
        $salaryExpense = max(0, round($grossEarnings - $absenceDeduction, 2));
        $deduction = round($absenceDeduction + $loan + $manualDeduction + $pf + $tax, 2);
        $netSalary = round($grossEarnings - $deduction, 2);
        if ($netSalary < 0) {
            throw ValidationException::withMessages(['deduction' => 'Total deductions exceed the payable earnings. Review attendance, loan, tax, PF, and manual deductions.']);
        }

        $payload = [
            'basic_salary' => $basic, 'allowance' => round($allowance + $otAmount, 2), 'bonus' => $bonus, 'arrears' => $arrears,
            'provident_fund' => $pf, 'tax_deduction' => $tax, 'gratuity_provision' => $gratuity,
            'deduction' => $deduction, 'net_salary' => $netSalary, 'working_days' => $workingDays,
            'daily_rate' => round($daily, 2), 'payable_days' => round($workingDays - $absenceDays, 2),
            'absent_days' => round($absent + $half, 2), 'unpaid_leave_days' => $unpaidLeave,
            'absence_deduction' => $absenceDeduction, 'loan_deduction' => $loan,
            'overtime_units' => $units, 'overtime_mode' => $mode, 'overtime_rate' => round($otRate, 2), 'overtime_amount' => $otAmount,
            'calculation' => ['gross_earnings' => $grossEarnings, 'salary_expense' => $salaryExpense, 'half_days' => $half, 'manual_allowance' => $allowance, 'manual_deduction' => $manualDeduction, 'overtime_multiplier' => $multiplier],
            'generated_by' => $userId, 'generated_at' => now(), 'status' => 'unpaid', 'approval_status' => 'draft',
        ];
        return StaffPayroll::updateOrCreate(['staff_id' => $staff->id, 'salary_month' => $month], $payload);
    }
    private function weekdays(Carbon $start,Carbon $end):int
    {
        $holidays=Event::where(fn($q)=>$q->where('type','Holiday')->orWhere('is_government_holiday',true))->whereDate('start_datetime','<=',$end)->whereDate('end_datetime','>=',$start)->get()->flatMap(function($event)use($start,$end){$dates=[];$from=Carbon::parse($event->start_datetime)->max($start);$to=Carbon::parse($event->end_datetime)->min($end);for($d=$from->copy();$d->lte($to);$d->addDay())$dates[]=$d->toDateString();return $dates;})->unique();
        $count=0; for($d=$start->copy();$d->lte($end);$d->addDay()) if(!$d->isWeekend()&&!$holidays->contains($d->toDateString()))$count++; return $count;
    }
}
