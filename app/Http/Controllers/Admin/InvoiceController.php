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

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['student', 'feeGroup']);

        if ($search = $request->get('search')) {
            $query->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('admission_no', 'like', "%{$search}%");
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
            'campuses' => Campus::select('id', 'name')->get(),
            'students' => Student::select('id', 'first_name', 'last_name', 'admission_no')->get(),
            'feeGroups' => FeeGroup::where('is_active', true)->select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'fee_group_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Invoice::create($data);
        return back()->with('success', 'নতুন ইনভয়েস তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $data = $this->validateData($request, $invoice->id);
        $invoice->update($data);
        return back()->with('success', 'ইনভয়েস আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        Invoice::findOrFail($id)->delete();
        return back()->with('success', 'ইনভয়েসটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? session('active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'student_id' => 'required|exists:students,id',
            'fee_group_id' => 'required|exists:fee_groups,id',
            'invoice_no' => [
                'required', 'string', 'max:100',
                Rule::unique('invoices', 'invoice_no')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'amount' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'fine' => 'nullable|numeric|min:0',
            'status' => 'required|in:Unpaid,Partial,Paid,Cancelled',
            'note' => 'nullable|string',
        ]);
    }
}