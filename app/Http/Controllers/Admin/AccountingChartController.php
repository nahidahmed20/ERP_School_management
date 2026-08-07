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

        $accounts = $query->orderBy('type')->latest()->paginate(15)->withQueryString();

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
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:accounts,code,' . $id,
            'type' => 'required|in:Asset,Liability,Equity,Income,Expense',
            'opening_balance' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $account->update($validated);
        return back()->with('success', 'Account details updated.');
    }

    public function destroy($id)
    {
        // Add check here later if transactions exist
        Account::findOrFail($id)->delete();
        return back()->with('success', 'Account deleted from Chart of Accounts.');
    }
}