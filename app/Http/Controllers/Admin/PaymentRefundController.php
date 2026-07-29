<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        $refunds = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();
        
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

        $refund = PaymentRefund::create($request->all());

        if ($refund->status == 'Refunded') {
            $refund->transaction->update(['status' => 'Refunded']);
        }

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

        $refund->update($request->only('amount', 'reason', 'status', 'refund_date'));

        if ($refund->status == 'Refunded') {
            $refund->transaction->update(['status' => 'Refunded']);
        }

        return back()->with('success', 'রিফান্ড আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Approved,Refunded,Rejected']);
        
        $refund = PaymentRefund::findOrFail($id);
        $refund->update(['status' => $request->status]);

        if ($request->status == 'Refunded') {
            $refund->transaction->update(['status' => 'Refunded']);
        }

        return back()->with('success', 'রিফান্ডের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        PaymentRefund::findOrFail($id)->delete();
        return back()->with('success', 'রিফান্ড রেকর্ড মুছে ফেলা হয়েছে!');
    }
}