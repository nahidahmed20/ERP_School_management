<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffPayroll;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffPayrollController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $month = $request->input('month');
        $status = $request->input('status');

        $query = StaffPayroll::with(['staff.designation'])->latest();

        // Search by Staff Name or ID
        if ($search) {
            $query->whereHas('staff', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('staff_id_no', 'like', "%{$search}%");
            });
        }

        // Filter by Month and Status
        if ($month) {
            $query->where('salary_month', $month);
        }

        if ($status) {
            $query->where('status', $status);
        }

        // Handle Pagination Safely
        $totalCount = $query->count();
        // If 'all', set perPage to totalCount (minimum 1 to avoid paginate(0) error)
        $perPageCount = ($perPage === 'all') ? ($totalCount > 0 ? $totalCount : 1) : (int) $perPage;

        $payrolls = $query->paginate($perPageCount)->withQueryString();

        return Inertia::render('Admin/StaffPayrolls/Index', [
            'payrolls' => $payrolls,
            'staffs' => Staff::where('is_active', true)
                            ->select('id', 'first_name', 'last_name', 'staff_id_no', 'basic_salary')
                            ->get(),
            'filters' => $request->only(['search', 'month', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id'      => 'required|exists:staff,id',
            'salary_month'  => 'required|string', // Format: YYYY-MM
            'basic_salary'  => 'required|numeric|min:0',
            'allowance'     => 'nullable|numeric|min:0',
            'deduction'     => 'nullable|numeric|min:0',
            'payment_method'=> 'nullable|string',
            'payment_date'  => 'nullable|date',
            'status'        => 'required|in:paid,unpaid,pending',
        ]);

        $exists = StaffPayroll::where('staff_id', $request->staff_id)
            ->where('salary_month', $request->salary_month)
            ->exists();

        if ($exists) {
            return back()->with('error', 'এই স্টাফের জন্য এই মাসের বেতন আগেই জেনারেট করা হয়েছে!');
        }

        $allowance = $request->allowance ?? 0;
        $deduction = $request->deduction ?? 0;
        $netSalary = ($request->basic_salary + $allowance) - $deduction;

        StaffPayroll::create([
            'staff_id'      => $request->staff_id,
            'salary_month'  => $request->salary_month,
            'basic_salary'  => $request->basic_salary,
            'allowance'     => $allowance,
            'deduction'     => $deduction,
            'net_salary'    => $netSalary,
            'payment_method'=> $request->payment_method,
            'payment_date'  => $request->payment_date,
            'status'        => $request->status,
            'note'          => $request->note,
        ]);

        return back()->with('success', 'বেতন (Payroll) সফলভাবে জেনারেট হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $payroll = StaffPayroll::findOrFail($id);

        $request->validate([
            'basic_salary'  => 'required|numeric|min:0',
            'allowance'     => 'nullable|numeric|min:0',
            'deduction'     => 'nullable|numeric|min:0',
            'payment_method'=> 'nullable|string',
            'payment_date'  => 'nullable|date',
            'status'        => 'required|in:paid,unpaid,pending',
        ]);

        $allowance = $request->allowance ?? 0;
        $deduction = $request->deduction ?? 0;
        $netSalary = ($request->basic_salary + $allowance) - $deduction;

        $payroll->update([
            'basic_salary'  => $request->basic_salary,
            'allowance'     => $allowance,
            'deduction'     => $deduction,
            'net_salary'    => $netSalary,
            'payment_method'=> $request->payment_method,
            'payment_date'  => $request->payment_date,
            'status'        => $request->status,
            'note'          => $request->note,
        ]);

        return back()->with('success', 'বেতনের তথ্য আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        StaffPayroll::findOrFail($id)->delete();
        return back()->with('success', 'বেতনের রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
