<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentTransaction::with('gateway');

        if ($search = $request->search) {
            $query->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('reference_no', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest('transaction_date')->paginate($request->per_page ?? 10)->withQueryString();
        $gateways = PaymentGateway::where('is_active', true)->get(['id', 'name']); // ফর্মের জন্য

        return Inertia::render('Admin/PaymentsTransactions/Index', [
            'transactions' => $transactions,
            'gateways' => $gateways,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_gateway_id' => 'nullable|exists:payment_gateways,id',
            'transaction_id' => 'required|string|unique:payment_transactions,transaction_id',
            'reference_no' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'status' => 'required|in:Pending,Completed,Failed,Refunded',
            'transaction_date' => 'required|date',
        ]);

        PaymentTransaction::create($request->all());

        return back()->with('success', 'ম্যানুয়াল ট্রানজেকশন সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $transaction = PaymentTransaction::findOrFail($id);
        
        $request->validate([
            'payment_gateway_id' => 'nullable|exists:payment_gateways,id',
            'transaction_id' => 'required|string|unique:payment_transactions,transaction_id,'.$id,
            'reference_no' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'status' => 'required|in:Pending,Completed,Failed,Refunded',
            'transaction_date' => 'required|date',
        ]);

        $transaction->update($request->all());

        return back()->with('success', 'ট্রানজেকশন আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Completed,Failed,Refunded']);
        
        $transaction = PaymentTransaction::findOrFail($id);
        $transaction->update(['status' => $request->status]);

        return back()->with('success', 'ট্রানজেকশনের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        PaymentTransaction::findOrFail($id)->delete();
        return back()->with('success', 'ট্রানজেকশন রেকর্ড মুছে ফেলা হয়েছে!');
    }
}