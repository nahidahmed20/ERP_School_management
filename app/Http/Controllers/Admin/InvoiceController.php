<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\FeeGroup;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Support\CampusRule;
use App\Services\FeePaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['student', 'feeGroup']);

        if ($search = $request->get('search')) {
            $query->where(function ($query) use ($search) {
                $query->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('admission_no', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('fee_group_id')) {
            $query->where('fee_group_id', $request->get('fee_group_id'));
        }

        $query->latest('invoice_date');

        $perPage = $request->get('per_page', 10);
        $invoices = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/FinanceInvoices/Index', [
            'invoices' => $invoices,
            'campuses' => Campus::whereKey(config('app.active_campus_id'))->select('id', 'name')->get(),
            'students' => Student::select('id', 'first_name', 'last_name', 'admission_no')->get(),
            'feeGroups' => FeeGroup::where('is_active', true)->select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'fee_group_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['paid_amount'] = 0;
        $data['status'] = 'Unpaid';
        Invoice::create($data);
        return back()->with('success', 'নতুন ইনভয়েস তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        DB::transaction(function () use ($request, $id) {
        $invoice = Invoice::whereKey($id)->lockForUpdate()->firstOrFail();
        abort_if((float)$invoice->paid_amount > 0 || $invoice->paymentAllocations()->exists(), 422, 'An invoice with payment activity cannot be edited. Use an adjustment or refund workflow.');
        $data = $this->validateData($request, $invoice->id);
        abort_if($invoice->fee_assignment_id && ((int) $data['student_id'] !== (int) $invoice->student_id || (int) $data['fee_group_id'] !== (int) $invoice->fee_group_id), 422, 'An assigned invoice cannot be moved to another student or fee group.');
        $data['status'] = $request->input('status') === 'Cancelled' ? 'Cancelled' : 'Unpaid';
        $invoice->update($data);
        if ($invoice->fee_assignment_id) app(FeePaymentService::class)->syncAssignment($invoice->fee_assignment_id);
        }, 3);
        return back()->with('success', 'ইনভয়েস আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
        $invoice=Invoice::whereKey($id)->lockForUpdate()->firstOrFail();
        abort_if((float)$invoice->paid_amount > 0 || $invoice->paymentAllocations()->exists(), 422, 'An invoice with payment activity cannot be deleted.');
        abort_if($invoice->fee_assignment_id, 422, 'Cancel generated invoices instead of deleting their billing history.');
        $invoice->delete();
        }, 3);
        return back()->with('success', 'ইনভয়েসটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = config('app.active_campus_id');

        $data = $request->validate([
            'campus_id' => ['required', 'integer', Rule::in([$campusId])],
            'student_id' => ['required', CampusRule::exists('students')],
            'fee_group_id' => ['required', Rule::exists('fee_groups', 'id')],
            'invoice_no' => [
                'required', 'string', 'max:100',
                Rule::unique('invoices', 'invoice_no')->ignore($ignoreId)
            ],
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'amount' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'fine' => 'nullable|numeric|min:0',
            'status' => 'required|in:Unpaid,Partial,Paid,Cancelled',
            'note' => 'nullable|string',
        ]);
        if ((float) ($data['discount'] ?? 0) > (float) $data['amount']) {
            throw ValidationException::withMessages(['discount' => 'Discount cannot exceed the invoice amount.']);
        }
        return $data;
    }
}
