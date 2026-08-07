<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{StaffLoan, Staff};
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        $loans = $query->latest()->paginate(15)->withQueryString();

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
            'staff_id' => 'required|exists:staff,id',
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
        ]);

        if ($validated['status'] === 'Approved') {
            $validated['approved_by'] = auth()->id();
        }

        StaffLoan::create($validated);
        return back()->with('success', 'Loan/Advance request saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $loan = StaffLoan::findOrFail($id);
        
        $validated = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'loan_type' => 'required|string|in:Advance Salary,Loan',
            'amount' => 'required|numeric|min:1',
            'monthly_deduction' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|string|in:Pending,Approved,Rejected,Completed',
        ]);

        if ($validated['status'] === 'Approved' && $loan->status !== 'Approved') {
            $validated['approved_by'] = auth()->id();
        }

        $loan->update($validated);
        return back()->with('success', 'Loan/Advance record updated.');
    }

    public function destroy($id)
    {
        StaffLoan::findOrFail($id)->delete();
        return back()->with('success', 'Record deleted successfully.');
    }
}