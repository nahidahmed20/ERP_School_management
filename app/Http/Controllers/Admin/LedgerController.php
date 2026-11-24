<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Models\RecurringExpense;
use App\Services\ExpenseAccountingService;
use App\Services\RecurringExpenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $campusId = $this->campusId();
        $entries = JournalEntry::whereNull('reversed_at');
        $income = (float) (clone $entries)->whereHas('creditAccount', fn ($q) => $q->where('type', 'Income'))->sum('amount')
            - (float) (clone $entries)->whereHas('debitAccount', fn ($q) => $q->where('type', 'Income'))->sum('amount');
        $expense = (float) (clone $entries)->whereHas('debitAccount', fn ($q) => $q->where('type', 'Expense'))->sum('amount')
            - (float) (clone $entries)->whereHas('creditAccount', fn ($q) => $q->where('type', 'Expense'))->sum('amount');

        return Inertia::render('Admin/FeesLedger/Index', [
            'totalIncome' => round($income, 2),
            'totalExpense' => round($expense, 2),
            'netProfit' => round($income - $expense, 2),
            'expenses' => Expense::with(['expenseAccount:id,name,code', 'paymentAccount:id,name,code'])
                ->where('status', '!=', 'void')->latest('expense_date')->latest('id')
                ->paginate(\App\Support\PerPage::resolve())->withQueryString(),
            'accounts' => Account::where('is_active', true)->orderBy('code')->get(['id', 'name', 'code', 'type']),
            'recurringExpenses' => RecurringExpense::with('expenseAccount:id,name,code')->orderBy('next_due_date')->get(),
            'filters' => ['campus_id' => $campusId],
        ]);
    }

    public function storeExpense(Request $request, ExpenseAccountingService $accounting)
    {
        $campusId = $this->campusId();
        $data = $this->validateExpense($request, $campusId);

        DB::transaction(function () use ($data, $campusId, $request, $accounting) {
            $expense = Expense::create($data + [
                'campus_id' => $campusId,
                'recorded_by' => (string) $request->user()->id,
                'created_by' => $request->user()->id,
                'paid_at' => $data['status'] === 'paid' ? $data['expense_date'] : null,
            ]);
            $accounting->sync($expense);
        }, 3);

        return back()->with('success', 'Expense saved and posted to the selected accounts.');
    }

    public function updateExpense(Request $request, int $id, ExpenseAccountingService $accounting)
    {
        $campusId = $this->campusId();
        $data = $this->validateExpense($request, $campusId);

        DB::transaction(function () use ($id, $data, $accounting) {
            $expense = Expense::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_unless($expense->status !== 'void', 422, 'A void expense cannot be edited.');
            $expense->update($data + [
                'paid_at' => $data['status'] === 'paid' ? ($expense->paid_at?->toDateString() ?? $data['expense_date']) : null,
                'payment_account_id' => $data['status'] === 'paid' ? $data['payment_account_id'] : null,
            ]);
            $accounting->sync($expense->fresh());
        }, 3);

        return back()->with('success', 'Expense updated and its accounting entries recalculated.');
    }

    public function payExpense(Request $request, int $id, ExpenseAccountingService $accounting)
    {
        $campusId = $this->campusId();
        $data = $request->validate([
            'payment_account_id' => ['required', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Asset')->where('is_active', true))],
            'paid_at' => ['required', 'date'],
        ]);
        $accounting->pay(Expense::findOrFail($id), (int) $data['payment_account_id'], $data['paid_at']);

        return back()->with('success', 'Expense payment recorded against the selected cash/bank account.');
    }

    public function destroyExpense(int $id, ExpenseAccountingService $accounting)
    {
        DB::transaction(function () use ($id, $accounting) {
            $expense = Expense::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_unless($expense->status !== 'void', 422, 'This expense is already void.');
            $expense->update(['status' => 'void', 'voided_at' => now()]);
            $accounting->sync($expense->fresh());
        }, 3);

        return back()->with('success', 'Expense voided; its ledger entries were reversed and retained for audit.');
    }

    public function storeRecurringExpense(Request $request, RecurringExpenseService $scheduler)
    {
        $campusId = $this->campusId();
        $data = $request->validate([
            'expense_head' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
            'expense_account_id' => ['required', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Expense')->where('is_active', true))],
            'frequency' => ['required', Rule::in(['weekly', 'monthly', 'quarterly', 'yearly'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
        $start = \Illuminate\Support\Carbon::parse($data['start_date']);
        $template = RecurringExpense::create($data + [
            'campus_id' => $campusId,
            'next_due_date' => $data['start_date'],
            'billing_day' => $start->day,
            'billing_month' => $start->month,
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);
        $scheduler->generateDue($campusId);

        return back()->with('success', 'Recurring schedule saved. Due expenses are created unpaid for approval and payment.');
    }

    public function stopRecurringExpense(int $id)
    {
        RecurringExpense::whereKey($id)->update(['is_active' => false]);
        return back()->with('success', 'Recurring expense schedule stopped. Existing expenses remain in the ledger.');
    }

    private function validateExpense(Request $request, int $campusId): array
    {
        $data = $request->validate([
            'expense_head' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
            'expense_account_id' => ['required', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Expense')->where('is_active', true))],
            'status' => ['required', Rule::in(['paid', 'unpaid'])],
            'payment_account_id' => [Rule::requiredIf($request->input('status') === 'paid'), 'nullable', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Asset')->where('is_active', true))],
        ]);
        $data['payment_account_id'] = $data['status'] === 'paid' ? (int) $data['payment_account_id'] : null;
        return $data;
    }

    private function campusId(): int
    {
        $campusId = (int) config('app.active_campus_id');
        abort_if(! $campusId, 422, 'Select a campus before managing expenses.');
        return $campusId;
    }
}
