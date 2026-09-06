<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
use App\Services\FeePaymentService;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentRefundController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentRefund::with('transaction');

        if ($search = $request->search) {
            $query->whereHas('transaction', function($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $refunds = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        
        $transactions = PaymentTransaction::where('status', 'Completed')->latest()->limit(50)->get();

        return Inertia::render('Admin/PaymentsRefunds/Index', [
            'refunds' => $refunds,
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_transaction_id' => ['required', CampusRule::exists('payment_transactions')],
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string',
            'refund_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($request) {
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($request->payment_transaction_id);
            $this->assertRefundable($transaction, (float) $request->amount);
            $refund = PaymentRefund::create($request->only('payment_transaction_id','amount','reason','refund_date')+['campus_id'=>$transaction->campus_id,'status'=>'Pending','requested_by'=>$request->user()->id]);
            $this->syncTransactionStatus($refund->transaction);
        });

        return back()->with('success', 'রিফান্ড রিকোয়েস্ট তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $refund = PaymentRefund::findOrFail($id);
        abort_unless($refund->status === 'Pending', 422, 'Only pending refunds can be edited.');
        
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string',
        ]);

        DB::transaction(function () use ($request, $refund) {
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($refund->payment_transaction_id);
            $this->assertRefundable($transaction, (float) $request->amount, $refund->id);
            $refund->update($request->only('amount', 'reason'));
            $this->syncTransactionStatus($transaction);
        });

        return back()->with('success', 'রিফান্ড আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id, FeePaymentService $payments)
    {
        $request->validate(['status' => 'required|in:Pending,Approved,Refunded,Rejected']);
        
        $refund = PaymentRefund::findOrFail($id);
        DB::transaction(function () use ($request, $refund, $payments) {
            $refund = PaymentRefund::whereKey($refund->id)->lockForUpdate()->firstOrFail();
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($refund->payment_transaction_id);
            abort_if((int)$refund->requested_by === (int)$request->user()->id && in_array($request->status,['Approved','Rejected','Refunded'],true), 403, 'Requester cannot approve or execute their own refund.');
            $allowed=['Pending'=>['Approved','Rejected'],'Approved'=>['Refunded','Rejected'],'Rejected'=>[],'Refunded'=>[]];
            abort_unless(in_array($request->status,$allowed[$refund->status]??[],true),422,'Invalid refund status transition.');
            if ($request->status === 'Refunded') {
                $this->assertRefundable($transaction, (float) $refund->amount, $refund->id);
                $payments->refund($transaction, (float) $refund->amount, $refund->id);
            }
            $refund->update([
                'status' => $request->status,
                'refund_date' => $request->status === 'Refunded' ? ($refund->refund_date ?? now()->toDateString()) : $refund->refund_date,
                'approved_by' => in_array($request->status,['Approved','Refunded'],true) ? $request->user()->id : $refund->approved_by,
                'approved_at' => $request->status === 'Approved' ? now() : $refund->approved_at,
            ]);
            $this->syncTransactionStatus($transaction);
        });

        return back()->with('success', 'রিফান্ডের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $refund = PaymentRefund::findOrFail($id);
        abort_unless($refund->status === 'Pending',422,'Only pending refunds can be deleted.');
        abort_unless((int)$refund->requested_by === (int)auth()->id(),403,'Only the requester can delete this refund.');
        $transaction = $refund->transaction;
        $refund->delete();
        $this->syncTransactionStatus($transaction);
        return back()->with('success', 'রিফান্ড রেকর্ড মুছে ফেলা হয়েছে!');
    }

    private function assertRefundable(PaymentTransaction $transaction, float $amount, ?int $ignoreRefund = null): void
    {
        $refunded = (float) $transaction->refunded_amount;

        if ($amount + $refunded > (float) $transaction->amount) {
            throw ValidationException::withMessages(['amount' => 'Refund amount মূল transaction amount-এর বেশি হতে পারবে না।']);
        }
    }

    private function syncTransactionStatus(PaymentTransaction $transaction): void
    {
        $refunded = (float) $transaction->fresh()->refunded_amount;
        $transaction->update(['status' => $refunded >= (float) $transaction->amount ? 'Refunded' : 'Completed']);
    }
}
