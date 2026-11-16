<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Exam;
use App\Models\Payment;
use App\Models\LeaveType;
use App\Models\StaffLeave;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PortalServiceController extends Controller
{
    public function staff(Request $request)
    {
        $staff = $request->user()->staff;
        abort_unless($staff, 403, 'A linked staff account is required.');
        return Inertia::render('Portal/StaffServices', [
            'staff' => $staff->load('department:id,name','designation:id,name'),
            'leaveTypes' => LeaveType::where('is_active', true)->get(['id','name']),
            'leaves' => $staff->leaves()->with('leaveType:id,name')->latest()->get(),
            'payrolls' => $staff->payrolls()->latest('salary_month')->get(),
            'shifts' => DB::table('staff_shifts')->where('staff_id',$staff->id)->whereDate('shift_date','>=',today())->orderBy('shift_date')->get(),
            'documents' => DB::table('staff_documents')->where('staff_id',$staff->id)->latest()->get(),
        ]);
    }

    public function staffLeave(Request $request)
    {
        $staff = $request->user()->staff; abort_unless($staff, 403);
        $data = $request->validate(['leave_type_id'=>'required|exists:leave_types,id','start_date'=>'required|date','end_date'=>'required|date|after_or_equal:start_date','reason'=>'required|string|max:2000']);
        $data['staff_id']=$staff->id; $data['total_days']=Carbon::parse($data['start_date'])->diffInDays(Carbon::parse($data['end_date']))+1; $data['status']='pending';
        StaffLeave::create($data); return back()->with('success','Leave request submitted.');
    }

    public function parent(Request $request)
    {
        $guardian=$request->user()->guardian; abort_unless($guardian,403,'A linked guardian account is required.');
        $children=\App\Models\Student::where(fn($q)=>$q->where('guardian_id',$guardian->id)->orWhereHas('guardians',fn($x)=>$x->where('guardians.id',$guardian->id)))->with('currentEnrollment.schoolClass')->get();
        return Inertia::render('Portal/ParentServices',[
            'children'=>$children, 'messages'=>DB::table('guardian_messages')->where('guardian_id',$guardian->id)->latest()->get(),
            'meetings'=>DB::table('parent_teacher_meetings')->where('guardian_id',$guardian->id)->latest()->get(),
            'consents'=>DB::table('parent_consents')->where('guardian_id',$guardian->id)->latest()->get(),
            'invoices'=>Invoice::whereIn('student_id',$children->pluck('id'))->latest()->get(),
            'leaves'=>DB::table('student_leave_requests')->where('guardian_id',$guardian->id)->latest()->get(),
            'payments'=>Payment::whereIn('student_id',$children->pluck('id'))->latest('payment_date')->get(),
            'publishedExams'=>Exam::where('results_published',true)->latest()->get(['id','name']),
            'clearances'=>DB::table('student_clearances')->whereIn('student_id',$children->pluck('id'))->get(),
            'timeline'=>DB::table('guardian_communication_events')->where('guardian_id',$guardian->id)->latest()->take(100)->get(),
            'guardian'=>$guardian,
        ]);
    }

    public function parentRequest(Request $request, string $service)
    {
        $guardian=$request->user()->guardian; abort_unless($guardian,403);
        $studentId=$request->validate(['student_id'=>'required|exists:students,id'])['student_id'];
        abort_unless(\App\Models\Student::where('id',$studentId)->where(fn($q)=>$q->where('guardian_id',$guardian->id)->orWhereHas('guardians',fn($x)=>$x->where('guardians.id',$guardian->id)))->exists(),403);
        if ($service==='message') {
            $data=$request->validate(['subject'=>'required|string|max:255','message'=>'required|string|max:3000']);
            DB::table('guardian_messages')->insert($data+['guardian_id'=>$guardian->id,'student_id'=>$studentId,'status'=>'open','created_at'=>now(),'updated_at'=>now()]);
        } elseif ($service==='meeting') {
            $data=$request->validate(['requested_at'=>'required|date|after:now','mode'=>'required|in:in_person,online,phone','agenda'=>'nullable|string|max:2000']);
            DB::table('parent_teacher_meetings')->insert($data+['campus_id'=>$guardian->campus_id,'guardian_id'=>$guardian->id,'student_id'=>$studentId,'status'=>'pending','created_at'=>now(),'updated_at'=>now()]);
        } elseif ($service==='leave') {
            $data=$request->validate(['start_date'=>'required|date','end_date'=>'required|date|after_or_equal:start_date','reason'=>'required|string|max:2000']);
            DB::table('student_leave_requests')->insert($data+['guardian_id'=>$guardian->id,'student_id'=>$studentId,'leave_type'=>'Parent requested','parent_status'=>'Approved','school_status'=>'Pending','created_at'=>now(),'updated_at'=>now()]);
        } else abort(404);
        DB::table('guardian_communication_events')->insert(['guardian_id'=>$guardian->id,'student_id'=>$studentId,'channel'=>$service,'direction'=>'inbound','subject'=>$data['subject']??ucfirst($service).' request','content'=>$data['message']??$data['agenda']??$data['reason']??'Request submitted','status'=>'submitted','created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Request submitted successfully.');
    }
}
