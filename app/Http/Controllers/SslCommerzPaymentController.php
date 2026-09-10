<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Services\AccountingService;
use App\Services\FeePaymentService;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SslCommerzPaymentController extends Controller
{
    public function initiate(Request $request, Invoice $invoice, SslCommerzService $gateway)
    {
        $student = $request->user()->student;
        abort_unless($student && (int) $invoice->student_id === (int) $student->id
            && (int) $invoice->campus_id === (int) $student->campus_id, 403);

        $transaction = DB::transaction(function () use ($request, $invoice, $student) {
            $invoice = Invoice::whereKey($invoice->id)->lockForUpdate()->firstOrFail();
            abort_if($invoice->status === 'Cancelled', 422, 'This invoice has been cancelled.');
            $due = max(0, (float) $invoice->amount + (float) $invoice->fine - (float) $invoice->discount - (float) $invoice->paid_amount);
            abort_if($due <= 0, 422, 'This invoice is already paid.');
            $amount = (float) $request->validate(['amount' => ['required', 'numeric', 'decimal:0,2', 'min:10', 'max:'.$due]])['amount'];
            $provider = PaymentGateway::firstOrCreate(['slug' => 'sslcommerz'], [
                'name' => 'SSLCommerz', 'currency' => 'BDT',
                'mode' => config('services.sslcommerz.sandbox') ? 'sandbox' : 'live', 'is_active' => true,
            ]);
            abort_unless($provider->is_active, 422, 'Online payments are currently disabled.');
            // Persist the reference before calling the provider so an early callback can find it.
            return PaymentTransaction::create([
                'campus_id' => $invoice->campus_id,
                'payment_gateway_id' => $provider->id,
                'transaction_id' => 'SSL-'.now()->format('YmdHis').'-'.Str::upper(Str::random(8)),
                'reference_no' => $invoice->invoice_no,
                'amount' => $amount, 'currency' => 'BDT', 'payment_method' => 'SSLCommerz',
                'status' => 'Pending', 'transaction_date' => today(),
                'source_type' => Invoice::class, 'source_id' => $invoice->id, 'student_id' => $student->id,
            ]);
        }, 3);

        $url = $gateway->createSession($invoice, $student->loadMissing('guardian'), $transaction->transaction_id, (float) $transaction->amount);
        return inertia()->location($url);
    }

    public function success(Request $request, SslCommerzService $gateway, FeePaymentService $payments)
    {
        $data = $request->validate(['val_id' => 'required|string', 'tran_id' => 'required|string']);
        $verified = $gateway->validate($data['val_id']);
        abort_unless(in_array($verified['status'] ?? '', ['VALID', 'VALIDATED'], true), 422, 'Payment was not verified.');
        $transaction = PaymentTransaction::withoutGlobalScopes()->where('transaction_id', $data['tran_id'])->firstOrFail();
        abort_unless(hash_equals((string) $transaction->transaction_id, (string) ($verified['tran_id'] ?? ''))
            && abs((float) $transaction->amount - (float) ($verified['amount'] ?? 0)) < .01
            && strtoupper($verified['currency'] ?? '') === 'BDT', 422, 'Payment details do not match.');

        DB::transaction(function () use ($transaction, $verified, $payments) {
            $transaction = PaymentTransaction::withoutGlobalScopes()->whereKey($transaction->id)->lockForUpdate()->firstOrFail();
            if (in_array($transaction->status, ['Completed', 'Refunded'], true)) {
                return;
            }
            abort_unless($transaction->status === 'Pending', 422, 'This transaction can no longer be completed.');
            $payments->applyOnlinePayment($transaction);
            $transaction->update(['status' => 'Completed', 'note' => 'SSLCommerz bank transaction: '.($verified['bank_tran_id'] ?? 'N/A')]);
            app(AccountingService::class)->post('online-payment:'.$transaction->id, $transaction, '1000', '4000', (float) $transaction->amount, 'Online fee payment '.$transaction->transaction_id, now()->toDateString(), 'Receipt');
        }, 3);

        if ($request->routeIs('payments.sslcommerz.ipn')) {
            return response()->json(['status' => 'accepted']);
        }
        return redirect()->route('portal.services', ['tab' => 'fees'])->with('success', 'Payment completed successfully.');
    }

    public function failed()
    {
        return redirect()->route('portal.services', ['tab' => 'fees'])->with('error', 'Payment was not completed. Its status will be reconciled securely.');
    }
}
