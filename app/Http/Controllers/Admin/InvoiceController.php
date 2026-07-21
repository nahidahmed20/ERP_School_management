<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['student.currentEnrollment.schoolClass', 'feeAssignment.feeGroup']);

        if ($request->search) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('admission_no', 'like', "%{$request->search}%")
                  ->orWhere('first_name', 'like', "%{$request->search}%");
            });
        }

        $payments = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/FeesInvoices/Index', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'per_page'])
        ]);
    }
}
