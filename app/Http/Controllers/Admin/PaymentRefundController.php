<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
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
            'payment_transaction_id' => 'required|exists:payment_transactions,id',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string',
            'status' => 'required|in:Pending,Approved,Refunded,Rejected',
            'refund_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($request) {
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($request->payment_transaction_id);
            $this->assertRefundable($transaction, (float) $request->amount);
            $refund = PaymentRefund::create($request->all());
            $this->syncTransactionStatus($refund->transaction);
        });

        return back()->with('success', 'রিফান্ড রিকোয়েস্ট তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $refund = PaymentRefund::findOrFail($id);
        
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string',
            'status' => 'required|in:Pending,Approved,Refunded,Rejected',
            'refund_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($request, $refund) {
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($refund->payment_transaction_id);
            $this->assertRefundable($transaction, (float) $request->amount, $refund->id);
            $refund->update($request->only('amount', 'reason', 'status', 'refund_date'));
            $this->syncTransactionStatus($transaction);
        });

        return back()->with('success', 'রিফান্ড আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Approved,Refunded,Rejected']);
        
        $refund = PaymentRefund::findOrFail($id);
        DB::transaction(function () use ($request, $refund) {
            $transaction = PaymentTransaction::lockForUpdate()->findOrFail($refund->payment_transaction_id);
            if ($request->status === 'Refunded') {
                $this->assertRefundable($transaction, (float) $refund->amount, $refund->id);
            }
            $refund->update([
                'status' => $request->status,
                'refund_date' => $request->status === 'Refunded' ? ($refund->refund_date ?? now()->toDateString()) : $refund->refund_date,
            ]);
            $this->syncTransactionStatus($transaction);
        });

        return back()->with('success', 'রিফান্ডের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $refund = PaymentRefund::findOrFail($id);
        $transaction = $refund->transaction;
        $refund->delete();
        $this->syncTransactionStatus($transaction);
        return back()->with('success', 'রিফান্ড রেকর্ড মুছে ফেলা হয়েছে!');
    }

    private function assertRefundable(PaymentTransaction $transaction, float $amount, ?int $ignoreRefund = null): void
    {
        $refunded = $transaction->refunds()->where('status', 'Refunded')
            ->when($ignoreRefund, fn ($query) => $query->where('id', '!=', $ignoreRefund))
            ->sum('amount');

        if ($amount + $refunded > (float) $transaction->amount) {
            throw ValidationException::withMessages(['amount' => 'Refund amount মূল transaction amount-এর বেশি হতে পারবে না।']);
        }
    }

    private function syncTransactionStatus(PaymentTransaction $transaction): void
    {
        $refunded = (float) $transaction->refunds()->where('status', 'Refunded')->sum('amount');
        $transaction->update(['status' => $refunded >= (float) $transaction->amount ? 'Refunded' : 'Completed']);
    }
}
