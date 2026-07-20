<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $totalIncome = Payment::sum('amount_paid');
        $totalExpense = Expense::sum('amount');

        $expenses = Expense::latest()->paginate(10);

        return Inertia::render('Admin/FeesLedger/Index', [
            'totalIncome'  => $totalIncome,
            'totalExpense' => $totalExpense,
            'netProfit'    => $totalIncome - $totalExpense,
            'expenses'     => $expenses
        ]);
    }

    public function storeExpense(Request $request)
    {
        $request->validate([
            'expense_head' => 'required|string|max:255',
            'amount'       => 'required|numeric|min:1',
            'expense_date' => 'required|date',
        ]);

        Expense::create($request->all());
        return back()->with('success', 'খরচের হিসাব সফলভাবে যুক্ত করা হয়েছে!');
    }
}
