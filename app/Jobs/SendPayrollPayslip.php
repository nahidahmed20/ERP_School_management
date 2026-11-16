<?php

namespace App\Jobs;

use App\Models\EmailLog;
use App\Models\StaffPayroll;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendPayrollPayslip implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $payrollId, public int $sentBy)
    {
        $this->onQueue('notifications');
    }

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(): void
    {
        $payroll = StaffPayroll::with('staff')->find($this->payrollId);
        if (! $payroll || ! $payroll->staff?->email || $payroll->payslip_emailed_at) return;

        $subject = 'Payslip for '.$payroll->salary_month;
        // Generated payroll stores overtime inside the total allowance column.
        $gross = (float) $payroll->basic_salary + (float) $payroll->allowance + (float) $payroll->bonus + (float) $payroll->arrears;
        $body = "Dear {$payroll->staff->first_name},\n\nYour payroll has been finalized.\nGross: BDT ".number_format($gross, 2)."\nDeduction: BDT ".number_format((float) $payroll->deduction, 2)."\nNet paid: BDT ".number_format((float) $payroll->net_salary, 2)."\nReference: ".($payroll->bank_reference ?: 'N/A');

        Mail::raw($body, fn ($mail) => $mail->to($payroll->staff->email)->subject($subject));
        EmailLog::create(['recipient_email'=>$payroll->staff->email, 'subject'=>$subject, 'body'=>$body, 'status'=>'Sent', 'sent_by'=>$this->sentBy]);
        $payroll->update(['payslip_emailed_at'=>now()]);
    }

    public function failed(?Throwable $exception): void
    {
        $payroll = StaffPayroll::with('staff')->find($this->payrollId);
        if (! $payroll?->staff?->email) return;
        EmailLog::create([
            'recipient_email'=>$payroll->staff->email,
            'subject'=>'Payslip for '.$payroll->salary_month,
            'body'=>'Payslip delivery failed after automatic retries.',
            'status'=>'Failed',
            'error_message'=>$exception?->getMessage(),
            'sent_by'=>$this->sentBy,
        ]);
    }
}
