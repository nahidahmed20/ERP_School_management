<?php

namespace Tests\Feature;

use App\Models\{AcademicSession,Campus,FeeAssignment,FeeGroup,Invoice,PaymentAllocation,PaymentTransaction,Student};
use App\Services\FeePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_fee_receipt_and_refund_keep_invoice_allocation_and_journal_in_sync(): void
    {
        $campus=Campus::create(['name'=>'Main','code'=>'MAIN']);
        config(['app.active_campus_id'=>$campus->id]);
        $student=Student::create(['campus_id'=>$campus->id,'guardian_id'=>1,'admission_no'=>'ST-1','admission_date'=>'2026-01-01','first_name'=>'Test','gender'=>'male','date_of_birth'=>'2015-01-01','present_address'=>'Dhaka','permanent_address'=>'Dhaka']);
        $session=AcademicSession::create(['campus_id'=>$campus->id,'name'=>'2026','start_date'=>'2026-01-01','end_date'=>'2026-12-31']);
        $group=FeeGroup::create(['name'=>'Tuition','is_active'=>true]);
        $assignment=FeeAssignment::create(['campus_id'=>$campus->id,'student_id'=>$student->id,'fee_group_id'=>$group->id,'academic_session_id'=>$session->id,'due_date'=>'2026-09-30','amount'=>1000,'status'=>'unpaid']);
        $invoice=Invoice::create(['campus_id'=>$campus->id,'student_id'=>$student->id,'fee_group_id'=>$group->id,'fee_assignment_id'=>$assignment->id,'invoice_no'=>'INV-1','invoice_date'=>'2026-09-01','due_date'=>'2026-09-30','amount'=>1000,'status'=>'Unpaid']);

        $payment=app(FeePaymentService::class)->receive($assignment,$student->id,600,['payment_date'=>'2026-09-06','payment_method'=>'Cash','transaction_id'=>null,'remarks'=>null]);
        $transaction=PaymentTransaction::where('source_id',$payment->id)->firstOrFail();
        $this->assertEquals(600,$invoice->fresh()->paid_amount);
        $this->assertSame('Partial',$invoice->fresh()->status);
        $this->assertDatabaseHas('payment_allocations',['payment_transaction_id'=>$transaction->id,'invoice_id'=>$invoice->id,'amount'=>600]);
        $this->assertDatabaseHas('journal_entries',['source_key'=>'fee-payment:'.$payment->id,'amount'=>600]);

        app(FeePaymentService::class)->refund($transaction,200,99);
        $this->assertEquals(400,$invoice->fresh()->paid_amount);
        $this->assertEquals(200,$transaction->fresh()->refunded_amount);
        $this->assertEquals(200,PaymentAllocation::first()->refunded_amount);
        $this->assertDatabaseHas('journal_entries',['source_key'=>'payment-refund:99','amount'=>200]);
    }

    public function test_payment_transactions_are_isolated_by_active_campus(): void
    {
        $a=Campus::create(['name'=>'A','code'=>'A']);$b=Campus::create(['name'=>'B','code'=>'B']);
        PaymentTransaction::withoutGlobalScopes()->create(['campus_id'=>$a->id,'transaction_id'=>'A-1','amount'=>10,'status'=>'Pending','transaction_date'=>'2026-09-06']);
        PaymentTransaction::withoutGlobalScopes()->create(['campus_id'=>$b->id,'transaction_id'=>'B-1','amount'=>10,'status'=>'Pending','transaction_date'=>'2026-09-06']);
        config(['app.active_campus_id'=>$a->id]);
        $this->assertSame(['A-1'],PaymentTransaction::pluck('transaction_id')->all());
    }
}
