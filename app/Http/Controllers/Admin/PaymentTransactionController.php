<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PaymentTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentTransaction::with('gateway');

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest('transaction_date')->paginate(\App\Support\PerPage::resolve())->withQueryString();
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
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);
        PaymentTransaction::create($request->only(['payment_gateway_id','transaction_id','reference_no','amount','payment_method','transaction_date'])+['campus_id'=>config('app.active_campus_id'),'currency'=>'BDT','status'=>'Pending']);

        return back()->with('success', 'ম্যানুয়াল ট্রানজেকশন সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $transaction = PaymentTransaction::findOrFail($id);
        abort_if($transaction->source_type,422,'System-generated transactions cannot be edited manually.');
        abort_unless(in_array($transaction->status,['Pending','Failed'],true),422,'Only pending or failed manual transactions can be edited.');
        
        $request->validate([
            'payment_gateway_id' => 'nullable|exists:payment_gateways,id',
            'transaction_id' => 'required|string|unique:payment_transactions,transaction_id,'.$id,
            'reference_no' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);
        $transaction->update($request->only(['payment_gateway_id','transaction_id','reference_no','amount','payment_method','transaction_date']));

        return back()->with('success', 'ট্রানজেকশন আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Failed']);
        
        $transaction = PaymentTransaction::findOrFail($id);
        abort_if($transaction->source_type,422,'System-generated transaction status is controlled by its payment workflow.');
        abort_unless(in_array($transaction->status,['Pending','Failed'],true),422,'This transaction is locked.');
        $transaction->update(['status' => $request->status]);

        return back()->with('success', 'ট্রানজেকশনের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $transaction = PaymentTransaction::findOrFail($id);
        if ($transaction->source_type) {
            return back()->with('error', 'System-generated transaction delete করা যাবে না; source record থেকে reversal করুন।');
        }
        abort_unless(in_array($transaction->status,['Pending','Failed'],true),422,'Completed financial records cannot be deleted.');
        $transaction->delete();
        return back()->with('success', 'ট্রানজেকশন রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
