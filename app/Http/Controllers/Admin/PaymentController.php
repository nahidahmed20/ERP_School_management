<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FeeAssignment;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\PaymentTransaction;
use App\Services\AccountingService;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $student = null;

        if ($request->filled('admission_no')) {
            $student = Student::with([
                'currentEnrollment.schoolClass',
                'currentEnrollment.section',
                'guardian',
                'feeAssignments' => function ($q) {
                    $q->whereIn('status', ['unpaid', 'partially_paid'])
                      ->with('feeGroup.feeTypes');
                }
            ])->where('admission_no', $request->admission_no)->first();

            if (!$student) {
                return back()->with('error', 'এই অ্যাডমিশন নম্বরের কোনো শিক্ষার্থী পাওয়া যায়নি!');
            }
        }

        return Inertia::render('Admin/FeesPayments/Index', [
            'student' => $student,
            'filters' => $request->only('admission_no')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fee_assignment_id' => 'required|exists:fee_assignments,id',
            'student_id'        => 'required|exists:students,id',
            'amount_paid'       => 'required|numeric|min:1',
            'payment_date'      => 'required|date',
            'payment_method'    => 'required|string',
            'transaction_id'    => ['nullable', 'string', 'max:255', Rule::unique('payments', 'transaction_id'), Rule::unique('payment_transactions', 'transaction_id')],
        ], [
            'amount_paid.min' => 'টাকার পরিমাণ কমপক্ষে ১ টাকা হতে হবে!',
            'fee_assignment_id.required' => 'কোন ফি-টি নিচ্ছেন তা সিলেক্ট করুন!',
        ]);

        DB::beginTransaction();
        try {
            $assignment = FeeAssignment::with('feeGroup.feeTypes')->lockForUpdate()->findOrFail($request->fee_assignment_id);

            if ((int) $assignment->student_id !== (int) $request->student_id) {
                throw ValidationException::withMessages(['student_id' => 'Selected fee এই student-এর নয়।']);
            }

            $totalFee = $assignment->feeGroup->feeTypes->sum('amount');

            $previouslyPaid = Payment::where('fee_assignment_id', $assignment->id)->sum('amount_paid');

            $totalPaidNow = $previouslyPaid + $request->amount_paid;

            if ($totalPaidNow > $totalFee) {
                throw ValidationException::withMessages([
                    'amount_paid' => 'বকেয়া টাকার চেয়ে বেশি payment নেওয়া যাবে না। Remaining: '.number_format(max(0, $totalFee - $previouslyPaid), 2),
                ]);
            }

            $payment = Payment::create([
                'fee_assignment_id' => $request->fee_assignment_id,
                'student_id'        => $request->student_id,
                'amount_paid'       => $request->amount_paid,
                'payment_date'      => $request->payment_date,
                'payment_method'    => $request->payment_method,
                'transaction_id'    => $request->transaction_id,
                'remarks'           => $request->remarks,
            ]);

            $transactionId = $request->transaction_id ?: 'FEE-'.$payment->id.'-'.now()->format('YmdHis');
            $payment->update(['transaction_id' => $transactionId]);
            PaymentTransaction::create([
                'transaction_id' => $transactionId, 'reference_no' => 'FEE-'.$assignment->id,
                'amount' => $request->amount_paid, 'currency' => 'BDT',
                'payment_method' => $request->payment_method, 'status' => 'Completed',
                'transaction_date' => $request->payment_date, 'note' => $request->remarks,
                'source_type' => Payment::class, 'source_id' => $payment->id, 'student_id' => $request->student_id,
            ]);

            app(AccountingService::class)->post(
                "fee-payment:{$payment->id}", $payment, '1000', '4000', (float) $request->amount_paid,
                "Student fee receipt {$transactionId}", $request->payment_date, 'Receipt'
            );

            if ($totalPaidNow >= $totalFee) {
                $assignment->update(['status' => 'paid']);
            } else {
                $assignment->update(['status' => 'partially_paid']);
            }

            DB::commit();
            return back()->with('success', 'পেমেন্ট সফলভাবে রিসিভ করা হয়েছে!');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'পেমেন্ট নিতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function feesInvoices(Request $request)
    {
        $query = Payment::with(['student.currentEnrollment.schoolClass', 'feeAssignment.feeGroup']);

        if ($request->search) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('admission_no', 'like', "%{$request->search}%")
                  ->orWhere('first_name', 'like', "%{$request->search}%");
            });
        }

        $payments = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();

        return Inertia::render('Admin/FeesInvoices/Index', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'per_page'])
        ]);
    }
}
