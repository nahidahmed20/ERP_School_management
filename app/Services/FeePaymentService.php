<?php

namespace App\Services;

use App\Models\{FeeAssignment, Invoice, Payment, PaymentAllocation, PaymentTransaction};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FeePaymentService
{
    public function receive(FeeAssignment $assignment, int $studentId, float $amount, array $details): Payment
    {
        return DB::transaction(function () use ($assignment, $studentId, $amount, $details) {
            $assignment=FeeAssignment::whereKey($assignment->id)->lockForUpdate()->firstOrFail();
            abort_unless((int)$assignment->student_id===$studentId,422,'Selected fee does not belong to this student.');
            $invoices=Invoice::where('fee_assignment_id',$assignment->id)->whereNotIn('status',['Paid','Cancelled'])->orderBy('due_date')->lockForUpdate()->get();
            if($invoices->isEmpty())$invoices=collect([$this->legacyInvoice($assignment)]);
            $due=$invoices->sum(fn($i)=>$this->due($i));
            if($amount>$due+.001)throw ValidationException::withMessages(['amount_paid'=>'Payment exceeds outstanding invoice balance. Remaining: '.number_format($due,2)]);

            $payment=Payment::create(['campus_id'=>$assignment->campus_id,'fee_assignment_id'=>$assignment->id,'student_id'=>$studentId,'amount_paid'=>$amount,'payment_date'=>$details['payment_date'],'payment_method'=>$details['payment_method'],'transaction_id'=>$details['transaction_id']??null,'remarks'=>$details['remarks']??null]);
            $transactionId=($details['transaction_id']??null)?:'FEE-'.$payment->id.'-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
            $payment->update(['transaction_id'=>$transactionId]);
            $transaction=PaymentTransaction::create(['campus_id'=>$assignment->campus_id,'transaction_id'=>$transactionId,'reference_no'=>'FEE-'.$assignment->id,'amount'=>$amount,'currency'=>'BDT','payment_method'=>$details['payment_method'],'status'=>'Completed','transaction_date'=>$details['payment_date'],'note'=>$details['remarks']??null,'source_type'=>Payment::class,'source_id'=>$payment->id,'student_id'=>$studentId]);

            $remaining=$amount;
            foreach($invoices as$invoice){if($remaining<=0)break;$allocation=min($remaining,$this->due($invoice));if($allocation<=0)continue;PaymentAllocation::create(['campus_id'=>$assignment->campus_id,'payment_id'=>$payment->id,'payment_transaction_id'=>$transaction->id,'invoice_id'=>$invoice->id,'amount'=>$allocation]);$this->changeInvoicePaid($invoice,$allocation);if(!$payment->invoice_id)$payment->update(['invoice_id'=>$invoice->id]);$remaining-=$allocation;}
            abort_if($remaining>.001,422,'Payment could not be fully allocated.');
            $assignment->update(['status'=>Invoice::where('fee_assignment_id',$assignment->id)->whereNotIn('status',['Paid','Cancelled'])->exists()?'partially_paid':'paid']);
            app(AccountingService::class)->post("fee-payment:{$payment->id}",$payment,'1000','4000',$amount,"Student fee receipt {$transactionId}",$details['payment_date'],'Receipt');
            return$payment;
        },3);
    }

    public function applyOnlinePayment(PaymentTransaction $transaction): void
    {
        $invoice=Invoice::withoutGlobalScopes()->whereKey($transaction->source_id)->lockForUpdate()->firstOrFail();
        abort_unless((int)$invoice->campus_id===(int)$transaction->campus_id,422,'Transaction campus mismatch.');
        $due=$this->due($invoice);$amount=(float)$transaction->amount;
        abort_if($amount<=0,422,'Invalid payment amount.');
        abort_if($amount>$due+.001,422,'Payment exceeds the current invoice balance.');
        PaymentAllocation::firstOrCreate(['payment_transaction_id'=>$transaction->id,'invoice_id'=>$invoice->id],['campus_id'=>$invoice->campus_id,'amount'=>$amount]);
        $this->changeInvoicePaid($invoice,$amount);
        if($invoice->fee_assignment_id)$this->syncAssignment($invoice->fee_assignment_id);
    }

    public function refund(PaymentTransaction $transaction, float $amount, int $refundId): void
    {
        $remaining=$amount;$allocations=$this->ensureAllocations($transaction);
        foreach($allocations as$allocation){if($remaining<=0)break;$available=(float)$allocation->amount-(float)$allocation->refunded_amount;$part=min($remaining,$available);if($part<=0)continue;$invoice=Invoice::withoutGlobalScopes()->whereKey($allocation->invoice_id)->lockForUpdate()->firstOrFail();$allocation->increment('refunded_amount',$part);$invoice->update(['paid_amount'=>max(0,(float)$invoice->paid_amount-$part)]);$this->syncInvoiceStatus($invoice);if($invoice->fee_assignment_id)$this->syncAssignment($invoice->fee_assignment_id);$remaining-=$part;}
        abort_if($remaining>.001,422,'Refund exceeds allocated payment balance.');
        $transaction->increment('refunded_amount',$amount);if($transaction->source_type===Payment::class)Payment::whereKey($transaction->source_id)->increment('refunded_amount',$amount);
        app(AccountingService::class)->post("payment-refund:{$refundId}",$transaction,'4000','1000',$amount,"Refund against {$transaction->transaction_id}",now()->toDateString(),'Payment');
    }

    private function legacyInvoice(FeeAssignment$assignment):Invoice{$assignment->loadMissing('feeGroup.feeTypes');$total=(float)($assignment->amount?:$assignment->feeGroup?->feeTypes?->sum('amount'));abort_if($total<=0,422,'The selected fee has no payable amount.');return Invoice::create(['campus_id'=>$assignment->campus_id,'student_id'=>$assignment->student_id,'fee_group_id'=>$assignment->fee_group_id,'fee_assignment_id'=>$assignment->id,'invoice_no'=>'LEGACY-'.$assignment->campus_id.'-'.$assignment->id,'invoice_date'=>today(),'due_date'=>$assignment->due_date,'amount'=>$total,'status'=>'Unpaid','note'=>'Automatically created while unifying legacy fee collection.']);}
    private function due(Invoice$i):float{return max(0,(float)$i->amount+(float)$i->fine-(float)$i->discount-(float)$i->paid_amount);}
    private function changeInvoicePaid(Invoice$i,float$a):void{$i->update(['paid_amount'=>(float)$i->paid_amount+$a]);$this->syncInvoiceStatus($i);}
    private function syncInvoiceStatus(Invoice$i):void{$due=$this->due($i);$i->update(['status'=>$due<=.001?'Paid':((float)$i->paid_amount>0?'Partial':'Unpaid')]);}
    private function syncAssignment(int$id):void{$invoices=Invoice::withoutGlobalScopes()->where('fee_assignment_id',$id)->where('status','!=','Cancelled')->get();$open=$invoices->contains(fn($i)=>$this->due($i)>.001);$paid=$invoices->sum('paid_amount');FeeAssignment::withoutGlobalScopes()->whereKey($id)->update(['status'=>!$open?'paid':($paid>.001?'partially_paid':'unpaid')]);}
    private function ensureAllocations(PaymentTransaction $transaction){$allocations=$transaction->allocations()->with('invoice')->lockForUpdate()->latest('id')->get();if($allocations->isNotEmpty())return$allocations;$invoice=null;$payment=null;if($transaction->source_type===Invoice::class)$invoice=Invoice::withoutGlobalScopes()->find($transaction->source_id);if($transaction->source_type===Payment::class){$payment=Payment::withoutGlobalScopes()->find($transaction->source_id);$invoice=$payment?->invoice_id?Invoice::withoutGlobalScopes()->find($payment->invoice_id):Invoice::withoutGlobalScopes()->where('fee_assignment_id',$payment?->fee_assignment_id)->latest('paid_amount')->first();}abort_unless($invoice,422,'This legacy transaction is not linked to an invoice and cannot be automatically refunded.');PaymentAllocation::create(['campus_id'=>$transaction->campus_id?:$invoice->campus_id,'payment_id'=>$payment?->id,'payment_transaction_id'=>$transaction->id,'invoice_id'=>$invoice->id,'amount'=>(float)$transaction->amount]);return$transaction->allocations()->with('invoice')->lockForUpdate()->get();}
}
