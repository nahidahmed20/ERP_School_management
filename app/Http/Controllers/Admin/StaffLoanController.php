<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{StaffLoan, Staff};
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
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => ['required', CampusRule::exists('staff')],
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
        ]);

        if ($validated['status'] === 'Approved') {
            $validated['approved_by'] = auth()->id();
            $validated['outstanding_balance'] = $validated['amount'];
        }

        StaffLoan::create($validated);
        return back()->with('success', 'Loan/Advance request saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $loan = StaffLoan::findOrFail($id);
        
        $validated = $request->validate([
            'staff_id' => ['required', CampusRule::exists('staff')],
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
        ]);

        if ($validated['status'] === 'Approved' && $loan->status !== 'Approved') {
            $validated['approved_by'] = auth()->id();
            $validated['outstanding_balance'] = $validated['amount'];
            $validated['settled_at'] = null;
        } elseif ($loan->status === 'Approved') {
            $repaid = max(0, (float) $loan->amount - (float) $loan->outstanding_balance);
            abort_if((float) $validated['amount'] < $repaid, 422, 'Loan amount cannot be lower than the amount already recovered.');
            $validated['outstanding_balance'] = max(0, (float) $validated['amount'] - $repaid);
        }

        $loan->update($validated);
        return back()->with('success', 'Loan/Advance record updated.');
    }

    public function destroy($id)
    {
        $loan = StaffLoan::findOrFail($id);
        abort_if(DB::table('staff_loan_repayments')->where('staff_loan_id', $loan->id)->exists(), 422, 'A loan with payroll repayments cannot be deleted.');
        $loan->delete();
        return back()->with('success', 'Record deleted successfully.');
    }
}
