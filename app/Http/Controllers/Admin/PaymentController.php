<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{FeeAssignment, Payment, Student};
use App\Services\FeePaymentService;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $student=null;
        $admissionNo=$request->input('admission_no',$request->input('search'));
        if($admissionNo){$student=Student::with(['currentEnrollment.schoolClass','currentEnrollment.section','guardian','feeAssignments'=>fn($q)=>$q->whereIn('status',['unpaid','partially_paid'])->with(['feeGroup.feeTypes','invoices'=>fn($i)=>$i->whereNotIn('status',['Paid','Cancelled'])])])->where('admission_no',$admissionNo)->first();if(!$student)return back()->with('error','No student was found with this admission number.');$student->feeAssignments->each(function($a){$outstanding=$a->invoices->sum(fn($i)=>max(0,(float)$i->amount+(float)$i->fine-(float)$i->discount-(float)$i->paid_amount));if($a->invoices->isEmpty())$outstanding=(float)($a->amount?:$a->feeGroup?->feeTypes?->sum('amount'));$a->setAttribute('outstanding_amount',round($outstanding,2));});}
        return Inertia::render('Admin/FeesPayments/Index',['student'=>$student,'filters'=>['admission_no'=>$admissionNo]]);
    }

    public function store(Request $request, FeePaymentService $service)
    {
        $data=$request->validate([
            'fee_assignment_id'=>['required',CampusRule::exists('fee_assignments')],
            'student_id'=>['required',CampusRule::exists('students')],
            'amount_paid'=>'required|numeric|min:1','payment_date'=>'required|date|before_or_equal:today',
            'payment_method'=>'required|in:Cash,Bank,Mobile Banking,Card,Cheque,Online',
            'transaction_id'=>['nullable','string','max:255',Rule::unique('payments','transaction_id'),Rule::unique('payment_transactions','transaction_id')],
            'remarks'=>'nullable|string|max:1000',
        ]);
        try{$service->receive(FeeAssignment::findOrFail($data['fee_assignment_id']),(int)$data['student_id'],(float)$data['amount_paid'],$data);}
        catch(ValidationException$e){throw$e;}
        catch(\Throwable$e){report($e);return back()->with('error','Payment could not be completed. No financial record was changed.');}
        return back()->with('success','Payment received, allocated to invoice and posted to accounts.');
    }

    public function feesInvoices(Request $request)
    {
        $query=Payment::with(['student.currentEnrollment.schoolClass','feeAssignment.feeGroup','invoice']);
        if($request->search)$query->whereHas('student',fn($q)=>$q->where('admission_no','like','%'.$request->search.'%')->orWhere('first_name','like','%'.$request->search.'%'));
        return Inertia::render('Admin/FeesInvoices/Index',['payments'=>$query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString(),'filters'=>$request->only(['search','per_page'])]);
    }
}
