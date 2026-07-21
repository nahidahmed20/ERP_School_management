<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FeeAssignment;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
        ], [
            'amount_paid.min' => 'টাকার পরিমাণ কমপক্ষে ১ টাকা হতে হবে!',
            'fee_assignment_id.required' => 'কোন ফি-টি নিচ্ছেন তা সিলেক্ট করুন!',
        ]);

        DB::beginTransaction();
        try {
            $assignment = FeeAssignment::with('feeGroup.feeTypes')->findOrFail($request->fee_assignment_id);

            $totalFee = $assignment->feeGroup->feeTypes->sum('amount');

            $previouslyPaid = Payment::where('fee_assignment_id', $assignment->id)->sum('amount_paid');

            $totalPaidNow = $previouslyPaid + $request->amount_paid;

            Payment::create([
                'fee_assignment_id' => $request->fee_assignment_id,
                'student_id'        => $request->student_id,
                'amount_paid'       => $request->amount_paid,
                'payment_date'      => $request->payment_date,
                'payment_method'    => $request->payment_method,
                'transaction_id'    => $request->transaction_id,
                'remarks'           => $request->remarks,
            ]);

            if ($totalPaidNow >= $totalFee) {
                $assignment->update(['status' => 'paid']);
            } else {
                $assignment->update(['status' => 'partially_paid']);
            }

            DB::commit();
            return back()->with('success', 'পেমেন্ট সফলভাবে রিসিভ করা হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'পেমেন্ট নিতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }
}
