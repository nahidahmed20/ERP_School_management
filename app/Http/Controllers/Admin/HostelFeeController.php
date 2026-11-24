<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Account, HostelFee, Student, HostelRoom};
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;

class HostelFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelFee::with(['student:id,first_name,last_name,admission_no', 'room:id,room_number,hostel_name']);

        if ($search = $request->get('search')) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($month = $request->get('month')) {
            $query->where('month', $month);
        }

        $fees = $query->latest('year')->latest('month')->paginate(\App\Support\PerPage::resolve(15))->withQueryString();

        return Inertia::render('Admin/Campus/Hostel/Fees/Index', [
            'fees' => $fees,
            'students' => Student::where('status', 1)->select('id', 'first_name', 'last_name', 'admission_no')->get(),
            'rooms' => HostelRoom::select('id', 'room_number', 'hostel_name')->get(),
            'accounts' => Account::where('is_active', true)->where('type', 'Asset')->orderBy('code')->get(['id', 'name', 'code']),
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'month' => $request->get('month', ''),
            ],
        ]);
    }

    public function store(Request $request, AccountingService $accounting)
    {
        $validated = $request->validate([
            'student_id' => ['required', CampusRule::exists('students')],
            'hostel_room_id' => ['nullable', CampusRule::exists('hostel_rooms')],
            'amount' => 'required|numeric|min:1',
            'month' => 'required|string',
            'year' => 'required|integer',
            'status' => 'required|in:Pending,Paid',
            'payment_date' => 'nullable|required_if:status,Paid|date',
            'payment_account_id' => ['nullable', 'required_if:status,Paid', \Illuminate\Validation\Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', config('app.active_campus_id'))->where('type', 'Asset')->where('is_active', true))],
            'remarks' => 'nullable|string',
        ]);

        $fee = HostelFee::create($validated);
        $this->syncAccounting($fee, $accounting);
        return back()->with('success', 'Hostel fee record added successfully.');
    }

    public function update(Request $request, $id, AccountingService $accounting)
    {
        $fee = HostelFee::findOrFail($id);

        $validated = $request->validate([
            'student_id' => ['required', CampusRule::exists('students')],
            'hostel_room_id' => ['nullable', CampusRule::exists('hostel_rooms')],
            'amount' => 'required|numeric|min:1',
            'month' => 'required|string',
            'year' => 'required|integer',
            'status' => 'required|in:Pending,Paid',
            'payment_date' => 'nullable|required_if:status,Paid|date',
            'payment_account_id' => ['nullable', 'required_if:status,Paid', \Illuminate\Validation\Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', config('app.active_campus_id'))->where('type', 'Asset')->where('is_active', true))],
            'remarks' => 'nullable|string',
        ]);

        $fee->update($validated);
        $this->syncAccounting($fee->fresh(), $accounting);
        return back()->with('success', 'Hostel fee record updated.');
    }

    public function destroy($id)
    {
        $fee = HostelFee::findOrFail($id);
        abort_if($fee->status === 'Paid', 422, 'Paid hostel fees cannot be deleted. Change the fee to Pending to reverse it first.');
        $fee->delete();
        return back()->with('success', 'Hostel fee record deleted.');
    }

    private function syncAccounting(HostelFee $fee, AccountingService $accounting): void
    {
        $accounting->reverseSource($fee);
        if ($fee->status !== 'Paid') return;
        $account = Account::whereKey($fee->payment_account_id)->where('campus_id', config('app.active_campus_id'))->where('type', 'Asset')->where('is_active', true)->firstOrFail();
        $accounting->post('hostel-fee:'.$fee->id, $fee, $account, '4000', (float) $fee->amount, 'Hostel fee '.$fee->month.' '.$fee->year, $fee->payment_date?->toDateString() ?? (string) $fee->payment_date, 'Receipt');
    }
}
