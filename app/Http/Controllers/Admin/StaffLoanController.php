<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Account, StaffLoan, Staff};
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;
use Illuminate\Support\Facades\DB;

class StaffLoanController extends Controller
{
    public function index(Request $request)
    {
        $query = StaffLoan::with(['staff:id,first_name,last_name,staff_id_no', 'approver:id,name']);

        if ($search = $request->get('search')) {
            $query->whereHas('staff', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('staff_id_no', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $loans = $query->latest()->paginate(\App\Support\PerPage::resolve(15))->withQueryString();

        return Inertia::render('Admin/People/Staff/Loans/Index', [
            'loans' => $loans,
            'staffList' => Staff::select('id', 'first_name', 'last_name', 'staff_id_no')->where('is_active', true)->get(),
            'accounts' => Account::where('is_active', true)->where('type', 'Asset')->orderBy('code')->get(['id', 'name', 'code']),
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    public function store(Request $request, AccountingService $accounting)
    {
        $campusId = (int) config('app.active_campus_id');
        $validated = $request->validate([
            'staff_id' => ['required', CampusRule::exists('staff')],
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
            'payment_account_id' => ['required_if:status,Approved,Completed', 'nullable', \Illuminate\Validation\Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Asset')->where('is_active', true))],
            'disbursed_at' => ['required_if:status,Approved,Completed', 'nullable', 'date', 'before_or_equal:today'],
        ]);
        abort_if($validated['status'] === 'Completed', 422, 'A loan can only be marked completed after its payroll deductions settle the outstanding balance.');

        if ($validated['status'] === 'Approved') {
            $validated['approved_by'] = auth()->id();
            $validated['outstanding_balance'] = $validated['amount'];
        }

        DB::transaction(function () use ($validated, $accounting) {
            $loan = StaffLoan::create($validated);
            if (in_array($loan->status, ['Approved', 'Completed'], true)) $loan->update(['disbursed_at' => $validated['disbursed_at']]);
            $this->syncAccounting($loan->fresh(), $accounting);
        }, 3);
        return back()->with('success', 'Loan/Advance request saved successfully.');
    }

    public function update(Request $request, $id, AccountingService $accounting)
    {
        $loan = StaffLoan::findOrFail($id);
        
        $validated = $request->validate([
            'staff_id' => ['required', CampusRule::exists('staff')],
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
            'payment_account_id' => ['required_if:status,Approved,Completed', 'nullable', \Illuminate\Validation\Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', config('app.active_campus_id'))->where('type', 'Asset')->where('is_active', true))],
            'disbursed_at' => ['required_if:status,Approved,Completed', 'nullable', 'date', 'before_or_equal:today'],
        ]);
        abort_if($validated['status'] === 'Completed' && $loan->status !== 'Completed', 422, 'A loan can only be marked completed after its payroll deductions settle the outstanding balance.');
        if (in_array($loan->status, ['Approved', 'Completed'], true) && ! in_array($validated['status'], ['Approved', 'Completed'], true)) {
            abort_if(DB::table('staff_loan_repayments')->where('staff_loan_id', $loan->id)->exists(), 422, 'A loan with payroll recoveries cannot be rejected or reopened.');
        }

        if ($validated['status'] === 'Approved' && $loan->status !== 'Approved') {
            $validated['approved_by'] = auth()->id();
            $validated['outstanding_balance'] = $validated['amount'];
            $validated['settled_at'] = null;
        } elseif ($loan->status === 'Approved') {
            $repaid = max(0, (float) $loan->amount - (float) $loan->outstanding_balance);
            abort_if((float) $validated['amount'] < $repaid, 422, 'Loan amount cannot be lower than the amount already recovered.');
            $validated['outstanding_balance'] = max(0, (float) $validated['amount'] - $repaid);
        }

        DB::transaction(function () use ($loan, $validated, $accounting) {
            if (in_array($validated['status'], ['Approved', 'Completed'], true)) {
                $validated['disbursed_at'] = $validated['disbursed_at'] ?? $loan->disbursed_at ?? today()->toDateString();
            } else {
                $validated['disbursed_at'] = $loan->disbursed_at;
            }
            $loan->update($validated);
            $this->syncAccounting($loan->fresh(), $accounting);
        }, 3);
        return back()->with('success', 'Loan/Advance record updated.');
    }

    public function destroy($id)
    {
        $loan = StaffLoan::findOrFail($id);
        abort_if(in_array($loan->status, ['Approved', 'Completed'], true), 422, 'A disbursed loan cannot be deleted. Use payroll deductions to settle it and keep its accounting audit trail.');
        abort_if(DB::table('staff_loan_repayments')->where('staff_loan_id', $loan->id)->exists(), 422, 'A loan with payroll repayments cannot be deleted.');
        $loan->delete();
        return back()->with('success', 'Record deleted successfully.');
    }

    private function syncAccounting(StaffLoan $loan, AccountingService $accounting): void
    {
        $accounting->reverseSource($loan);
        if (! in_array($loan->status, ['Approved', 'Completed'], true)) return;
        $account = Account::whereKey($loan->payment_account_id)->where('campus_id', $loan->campus_id)->where('type', 'Asset')->where('is_active', true)->firstOrFail();
        $accounting->post('staff-loan:'.$loan->id, $loan, '1300', $account, (float) $loan->amount, 'Staff '.$loan->loan_type.' disbursement #'.$loan->id, $loan->disbursed_at?->toDateString() ?? (string) $loan->disbursed_at, 'Payment');
    }
}
