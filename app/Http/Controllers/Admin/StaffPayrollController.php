<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffPayroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\StaffAttendance;
use App\Services\PayrollService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Support\CampusRule;

class StaffPayrollController extends Controller
{
    public function generate(Request $request, PayrollService $service)
    {
        $data=$request->validate([
            'salary_month'=>'required|date_format:Y-m','staff_id'=>['nullable',CampusRule::exists('staff')],'working_days'=>'nullable|integer|min:1|max:31',
            'overtime_enabled'=>'required|boolean','overtime_mode'=>'required_if:overtime_enabled,true|in:hour,day','overtime_rate'=>'nullable|numeric|min:0',
            'overtime_multiplier'=>'nullable|numeric|min:0|max:10','allowance'=>'nullable|numeric|min:0','deduction'=>'nullable|numeric|min:0',
            'bonus'=>'nullable|numeric|min:0','arrears'=>'nullable|numeric|min:0','provident_fund_rate'=>'nullable|numeric|min:0|max:100','tax_rate'=>'nullable|numeric|min:0|max:100','gratuity_rate'=>'nullable|numeric|min:0|max:100',
        ]);
        $staff=Staff::where('is_active',true)->when($data['staff_id']??null,fn($q,$id)=>$q->whereKey($id))->get();
        DB::transaction(fn()=> $staff->each(fn($person)=>$service->generate($person,$data['salary_month'],$data,$request->user()->id)));
        return back()->with('success',"Payroll generated for {$staff->count()} staff member(s).");
    }

    public function attendanceAdjustment(Request $request, StaffAttendance $attendance)
    {
        $data=$request->validate(['salary_paid_override'=>'required|boolean','overtime_hours'=>'nullable|numeric|min:0|max:24','overtime_days'=>'nullable|numeric|min:0|max:2','payroll_note'=>'nullable|string|max:1000']);
        $attendance->update($data); return back()->with('success','Attendance payroll adjustment saved.');
    }

    public function attendance(Request $request)
    {
        $data=$request->validate(['salary_month'=>'required|date_format:Y-m','staff_id'=>['nullable',CampusRule::exists('staff')]]);
        return response()->json(StaffAttendance::with('staff:id,first_name,last_name,staff_id_no')->whereBetween('date',[$data['salary_month'].'-01',Carbon::parse($data['salary_month'].'-01')->endOfMonth()->toDateString()])->when($data['staff_id']??null,fn($q,$id)=>$q->where('staff_id',$id))->whereIn('status',['absent','half_day'])->orderBy('date')->get());
    }
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
            'attendanceAdjustments' => StaffAttendance::with('staff:id,first_name,last_name,staff_id_no')
                ->whereBetween('date', [($month ?: now()->format('Y-m')).'-01', Carbon::parse(($month ?: now()->format('Y-m')).'-01')->endOfMonth()])
                ->orderBy('date')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id'      => ['required', CampusRule::exists('staff')],
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
            'generated_by'  => $request->user()->id,
            'generated_at'  => now(),
        ]);

        return back()->with('success', 'বেতন (Payroll) সফলভাবে জেনারেট হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $payroll = StaffPayroll::findOrFail($id);
        abort_if($payroll->approval_status==='finalized',422,'Finalized payroll cannot be changed.');

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
        $payroll=StaffPayroll::findOrFail($id); abort_if($payroll->approval_status==='finalized',422,'Finalized payroll cannot be deleted.'); $payroll->delete();
        return back()->with('success', 'বেতনের রেকর্ড মুছে ফেলা হয়েছে!');
    }

    public function approve(Request $request, StaffPayroll $payroll)
    {
        abort_if($payroll->approval_status==='finalized',422,'Finalized payroll cannot be changed.');
        abort_if((int)$payroll->generated_by===(int)$request->user()->id,403,'Payroll generator cannot approve the same payroll.');
        $payroll->update(['approval_status'=>'approved','approved_by'=>$request->user()->id,'approved_at'=>now()]);
        return back()->with('success','Payroll approved.');
    }

    public function finalize(Request $request, StaffPayroll $payroll)
    {
        abort_unless($payroll->approval_status==='approved',422,'Approve payroll before finalizing.');
        abort_if((int)$payroll->approved_by===(int)$request->user()->id,403,'Payroll approver cannot finalize the same payroll.');
        $data=$request->validate(['payment_method'=>'required|string|max:100','bank_reference'=>'nullable|string|max:255','payment_date'=>'required|date']);
        $payroll->update($data+['approval_status'=>'finalized','finalized_at'=>now(),'status'=>'paid']);
        return back()->with('success','Payroll finalized and locked.');
    }

    public function bankSheet(Request $request)
    {
        $month=$request->validate(['month'=>'required|date_format:Y-m'])['month'];
        $rows=StaffPayroll::with('staff')->where('salary_month',$month)->whereIn('approval_status',['approved','finalized'])->get();
        $csv="Staff ID,Name,Bank,Account Name,Account Number,Routing Number,Net Salary\n".$rows->map(fn($p)=>collect([$p->staff?->staff_id_no,trim(($p->staff?->first_name??'').' '.($p->staff?->last_name??'')),$p->staff?->bank_name,$p->staff?->bank_account_name,$p->staff?->bank_account_number,$p->staff?->bank_routing_number,$p->net_salary])->map(fn($v)=>'"'.str_replace('"','""',(string)$v).'"')->join(','))->join("\n");
        return response($csv,200,['Content-Type'=>'text/csv','Content-Disposition'=>"attachment; filename=bank-sheet-{$month}.csv"]);
    }
}
