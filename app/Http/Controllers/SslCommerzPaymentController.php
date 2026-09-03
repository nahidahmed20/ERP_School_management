<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\AccountingService;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SslCommerzPaymentController extends Controller
{
    public function initiate(Request $request, Invoice $invoice, SslCommerzService $gateway)
    {
        $student = $request->user()->student;
        abort_unless($student && (int) $invoice->student_id === (int) $student->id, 403);
        $due = max(0, (float) $invoice->amount + (float) $invoice->fine - (float) $invoice->discount - (float) $invoice->paid_amount);
        abort_if($due <= 0, 422, 'This invoice is already paid.');
        $amount = (float) $request->validate(['amount' => ['required', 'numeric', 'min:10', 'max:'.$due]])['amount'];
        $transactionId = 'SSL-'.now()->format('YmdHis').'-'.Str::upper(Str::random(8));
        $provider = PaymentGateway::firstOrCreate(['slug' => 'sslcommerz'], ['name' => 'SSLCommerz', 'currency' => 'BDT', 'mode' => config('services.sslcommerz.sandbox') ? 'sandbox' : 'live', 'is_active' => true]);
        $url = $gateway->createSession($invoice, $student->loadMissing('guardian'), $transactionId, $amount);
        PaymentTransaction::create(['payment_gateway_id' => $provider->id, 'transaction_id' => $transactionId, 'reference_no' => $invoice->invoice_no, 'amount' => $amount, 'currency' => 'BDT', 'payment_method' => 'SSLCommerz', 'status' => 'Pending', 'transaction_date' => today(), 'source_type' => Invoice::class, 'source_id' => $invoice->id, 'student_id' => $student->id]);
        return inertia()->location($url);
    }

    public function success(Request $request, SslCommerzService $gateway)
    {
        $data = $request->validate(['val_id' => 'required|string', 'tran_id' => 'required|string']);
        $verified = $gateway->validate($data['val_id']);
        abort_unless(in_array($verified['status'] ?? '', ['VALID', 'VALIDATED'], true), 422, 'Payment was not verified.');
        $transaction = PaymentTransaction::where('transaction_id', $data['tran_id'])->firstOrFail();
        abort_unless(hash_equals((string) $transaction->transaction_id, (string) ($verified['tran_id'] ?? '')) && abs((float) $transaction->amount - (float) ($verified['amount'] ?? 0)) < .01 && strtoupper($verified['currency'] ?? '') === 'BDT', 422, 'Payment details do not match.');
        DB::transaction(function () use ($transaction, $verified) {
            $transaction->lockForUpdate()->refresh();
            if ($transaction->status === 'Completed') return;
            $invoice = Invoice::withoutGlobalScopes()->lockForUpdate()->findOrFail($transaction->source_id);
            $paid = min((float) $invoice->amount + (float) $invoice->fine - (float) $invoice->discount, (float) $invoice->paid_amount + (float) $transaction->amount);
            $invoice->update(['paid_amount' => $paid, 'status' => $paid >= ((float) $invoice->amount + (float) $invoice->fine - (float) $invoice->discount) ? 'Paid' : 'Partial']);
            $transaction->update(['status' => 'Completed', 'note' => 'SSLCommerz bank transaction: '.($verified['bank_tran_id'] ?? 'N/A')]);
            app(AccountingService::class)->post('online-payment:'.$transaction->id, $transaction, '1000', '4000', (float) $transaction->amount, 'Online fee payment '.$transaction->transaction_id, now()->toDateString(), 'Receipt');
        });
        return redirect()->route('portal.services', ['tab' => 'fees'])->with('success', 'Payment completed successfully.');
    }

    public function failed(Request $request)
    {
        PaymentTransaction::where('transaction_id', $request->input('tran_id'))->where('status', 'Pending')->update(['status' => 'Failed']);
        return redirect()->route('portal.services', ['tab' => 'fees'])->with('error', 'Payment was not completed.');
    }
}
