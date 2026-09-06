<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountingChartController extends Controller
{
    public function index(Request $request)
    {
        $query = Account::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        $accounts = $query->orderBy('type')->latest()->paginate(\App\Support\PerPage::resolve(15))->withQueryString();

        return Inertia::render('Admin/Finance/Accounts/Chart/Index', [
            'accounts' => $accounts,
            'filters' => [
                'search' => $request->get('search', ''),
                'type' => $request->get('type', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:accounts,code',
            'type' => 'required|in:Asset,Liability,Equity,Income,Expense',
            'opening_balance' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Account::create($validated);
        return back()->with('success', 'Account created successfully in the Chart of Accounts.');
    }

    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);
        $hasEntries=$account->debitEntries()->exists()||$account->creditEntries()->exists();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:accounts,code,' . $id,
            'type' => 'required|in:Asset,Liability,Equity,Income,Expense',
            'opening_balance' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        abort_if($hasEntries&&($validated['code']!==$account->code||$validated['type']!==$account->type||(float)$validated['opening_balance']!==(float)$account->opening_balance),422,'An account used in journals cannot change code, type, or opening balance.');

        $account->update($validated);
        return back()->with('success', 'Account details updated.');
    }

    public function destroy($id)
    {
        $account=Account::findOrFail($id);
        abort_if($account->debitEntries()->exists()||$account->creditEntries()->exists(),422,'An account used in journals cannot be deleted. Deactivate it instead.');
        $account->delete();
        return back()->with('success', 'Account deleted from Chart of Accounts.');
    }
}
