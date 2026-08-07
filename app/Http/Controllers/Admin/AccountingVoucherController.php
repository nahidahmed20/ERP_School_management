<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{JournalEntry, Account};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AccountingVoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = JournalEntry::with(['debitAccount:id,name,code', 'creditAccount:id,name,code', 'creator:id,name']);

        if ($search = $request->get('search')) {
            $query->where('voucher_no', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($type = $request->get('type')) {
            $query->where('voucher_type', $type);
        }

        $vouchers = $query->latest('date')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Finance/Accounts/Vouchers/Index', [
            'vouchers' => $vouchers,
            'accounts' => Account::where('is_active', true)->select('id', 'name', 'code', 'type')->get(),
            'filters' => [
                'search' => $request->get('search', ''),
                'type' => $request->get('type', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'voucher_type' => 'required|in:Receipt,Payment,Contra,Journal',
            'debit_account_id' => 'required|exists:accounts,id|different:credit_account_id',
            'credit_account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
        ]);

        // Generate Voucher Number
        $validated['voucher_no'] = 'VCH-' . date('ym') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $validated['created_by'] = auth()->id();

        JournalEntry::create($validated);
        return back()->with('success', 'Accounting Voucher posted successfully.');
    }

    public function destroy($id)
    {
        JournalEntry::findOrFail($id)->delete();
        return back()->with('success', 'Voucher deleted / reversed.');
    }
}