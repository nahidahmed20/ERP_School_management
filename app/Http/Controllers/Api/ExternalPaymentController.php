<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExternalPaymentController extends Controller
{
    /**
     * Get the due invoices for a student using their unique ID (admission_no).
     */
    public function getDues($admission_no)
    {
        $student = Student::where('admission_no', $admission_no)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found with this Unique ID.'
            ], 404);
        }

        $invoices = FeeInvoice::where('student_id', $student->id)
            ->whereIn('status', ['unpaid', 'partial'])
            ->get()
            ->map(function ($invoice) {
                $due = ($invoice->amount + $invoice->fine) - ($invoice->discount + $invoice->paid_amount);
                return [
                    'invoice_id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'title' => $invoice->title ?? 'School Fee',
                    'due_date' => $invoice->due_date,
                    'due_amount' => $due,
                ];
            });

        $total_due = $invoices->sum('due_amount');

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'admission_no' => $student->admission_no,
                'campus_id' => $student->campus_id,
            ],
            'total_due' => $total_due,
            'invoices' => $invoices
        ]);
    }

    /**
     * Process a payment from the external app.
     */
    public function payDues(Request $request, $admission_no)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string', // e.g., bkash, nagad, custom_app
            'transaction_id' => 'required|string',
        ]);

        $student = Student::where('admission_no', $admission_no)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found.'
            ], 404);
        }

        $amountToPay = $request->amount;
        $invoices = FeeInvoice::where('student_id', $student->id)
            ->whereIn('status', ['unpaid', 'partial'])
            ->orderBy('due_date', 'asc')
            ->get();

        $processedInvoices = [];

        DB::beginTransaction();
        try {
            foreach ($invoices as $invoice) {
                if ($amountToPay <= 0) break;

                $due = ($invoice->amount + $invoice->fine) - ($invoice->discount + $invoice->paid_amount);
                
                if ($due <= 0) continue;

                $payAmount = min($due, $amountToPay);

                FeePayment::create([
                    'fee_invoice_id' => $invoice->id,
                    'amount_paid' => $payAmount,
                    'payment_date' => now(),
                    'payment_method' => $request->payment_method,
                    'transaction_id' => $request->transaction_id,
                    'status' => 'successful',
                    'recorded_by' => null, // API payment
                    'note' => 'Paid via External Payment App'
                ]);

                $invoice->paid_amount += $payAmount;
                if ($invoice->paid_amount >= ($invoice->amount + $invoice->fine - $invoice->discount)) {
                    $invoice->status = 'paid';
                } else {
                    $invoice->status = 'partial';
                }
                $invoice->save();

                $amountToPay -= $payAmount;
                $processedInvoices[] = $invoice->invoice_no;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully.',
                'invoices_processed' => $processedInvoices,
                'remaining_balance_unapplied' => $amountToPay > 0 ? $amountToPay : 0
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Payment failed. ' . $e->getMessage()
            ], 500);
        }
    }
}
