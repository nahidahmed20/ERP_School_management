<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{HostelAllocation, HostelBed, HostelRoom};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class HostelOperationsController extends Controller
{
    private function raw(string $table)
    {
        return DB::table($table)->where($table.'.campus_id', config('app.active_campus_id'));
    }
    private function campusExists(string $table)
    {
        return Rule::exists($table, 'id')->where(fn ($query) => $query->where('campus_id', config('app.active_campus_id')));
    }
    public function index()
    {
        $allocations = HostelAllocation::with(['user:id,name,email','room:id,hostel_name,room_number,bed_capacity','bed:id,bed_number'])
            ->latest()->get();
        $rooms = HostelRoom::withCount(['allocations as occupied' => fn ($q) => $q->where('is_active', true)])
            ->with('beds:id,hostel_room_id,bed_number,status')->orderBy('hostel_name')->orderBy('room_number')->get();

        return Inertia::render('Admin/HostelOperations/Index', [
            'allocations' => $allocations,
            'rooms' => $rooms,
            'attendance' => $this->raw('hostel_attendances')->latest('attendance_date')->take(100)->get(),
            'visitors' => $this->raw('hostel_visitors')->latest('check_in_at')->take(100)->get(),
            'meals' => $this->raw('hostel_meal_allocations')->latest('meal_date')->take(100)->get(),
            'ledger' => $this->raw('hostel_ledger_entries')->latest('occurred_at')->take(150)->get(),
            'changes' => $this->raw('hostel_room_changes')->latest('changed_at')->take(100)->get(),
            'clearances' => $this->raw('hostel_clearances')->latest()->take(100)->get(),
            'summary' => [
                'rooms' => $rooms->count(),
                'beds' => $rooms->sum('bed_capacity'),
                'occupied' => $allocations->where('is_active', true)->count(),
                'presentToday' => $this->raw('hostel_attendances')->whereDate('attendance_date', today())->where('status','present')->count(),
                'openVisitors' => $this->raw('hostel_visitors')->whereNull('check_out_at')->count(),
                'outstanding' => $this->raw('hostel_ledger_entries')->where('status','due')->whereIn('type',['damage_charge','meal_charge','other_charge'])->sum('amount'),
            ],
        ]);
    }

    public function bed(Request $request)
    {
        $data=$request->validate(['hostel_room_id'=>['required',$this->campusExists('hostel_rooms')],'bed_number'=>'required|string|max:50']);
        HostelBed::firstOrCreate($data, ['status'=>'available']);
        return back()->with('success','Hostel bed saved.');
    }

    public function checkIn(Request $request)
    {
        $data=$request->validate(['hostel_allocation_id'=>['required',$this->campusExists('hostel_allocations')],'hostel_bed_id'=>['required',$this->campusExists('hostel_beds')],'checked_in_at'=>'required|date','security_deposit'=>'nullable|numeric|min:0']);
        DB::transaction(function () use ($data,$request) {
            $allocation=HostelAllocation::lockForUpdate()->findOrFail($data['hostel_allocation_id']);
            $bed=HostelBed::lockForUpdate()->findOrFail($data['hostel_bed_id']);
            if($bed->hostel_room_id !== $allocation->hostel_room_id || $bed->status !== 'available') throw ValidationException::withMessages(['hostel_bed_id'=>'Selected bed is unavailable or belongs to another room.']);
            HostelAllocation::where('user_id',$allocation->user_id)->where('is_active',true)->whereKeyNot($allocation->id)->update(['is_active'=>false,'checked_out_at'=>now()]);
            $allocation->update(['hostel_bed_id'=>$bed->id,'checked_in_at'=>$data['checked_in_at'],'checked_out_at'=>null,'is_active'=>true]);
            $bed->update(['status'=>'occupied']);
            if(($data['security_deposit']??0)>0) $this->ledger($allocation->id,'security_deposit',$data['security_deposit'],'paid','Deposit received',$request->user()->id);
        });
        return back()->with('success','Resident checked in successfully.');
    }

    public function move(Request $request, HostelAllocation $allocation)
    {
        $data=$request->validate(['hostel_bed_id'=>['required',$this->campusExists('hostel_beds')],'reason'=>'nullable|string|max:1000']);
        DB::transaction(function () use($allocation,$data,$request){
            $new=HostelBed::lockForUpdate()->findOrFail($data['hostel_bed_id']);
            if($new->status!=='available') throw ValidationException::withMessages(['hostel_bed_id'=>'Selected bed is not available.']);
            $this->raw('hostel_room_changes')->insert(['campus_id'=>config('app.active_campus_id'),'hostel_allocation_id'=>$allocation->id,'from_room_id'=>$allocation->hostel_room_id,'from_bed_id'=>$allocation->hostel_bed_id,'to_room_id'=>$new->hostel_room_id,'to_bed_id'=>$new->id,'changed_at'=>now(),'reason'=>$data['reason']??null,'changed_by'=>$request->user()->id,'created_at'=>now(),'updated_at'=>now()]);
            if($allocation->hostel_bed_id) HostelBed::whereKey($allocation->hostel_bed_id)->update(['status'=>'available']);
            $new->update(['status'=>'occupied']);
            $allocation->update(['hostel_room_id'=>$new->hostel_room_id,'hostel_bed_id'=>$new->id]);
        });
        return back()->with('success','Room/bed changed and history recorded.');
    }

    public function attendance(Request $request)
    {
        $data=$request->validate(['hostel_allocation_id'=>['required',$this->campusExists('hostel_allocations')],'attendance_date'=>'required|date','status'=>'required|in:present,absent,leave','check_time'=>'nullable','remarks'=>'nullable|string']);
        $this->raw('hostel_attendances')->updateOrInsert(['hostel_allocation_id'=>$data['hostel_allocation_id'],'attendance_date'=>$data['attendance_date']],$data+['campus_id'=>config('app.active_campus_id'),'recorded_by'=>$request->user()->id,'created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Hostel attendance recorded.');
    }

    public function visitor(Request $request)
    {
        $data=$request->validate(['hostel_allocation_id'=>['required',$this->campusExists('hostel_allocations')],'visitor_name'=>'required|string|max:255','phone'=>'nullable|string|max:30','relation'=>'nullable|string|max:100','id_number'=>'nullable|string|max:100','check_in_at'=>'required|date','purpose'=>'nullable|string']);
        $this->raw('hostel_visitors')->insert($data+['campus_id'=>config('app.active_campus_id'),'approved_by'=>$request->user()->id,'created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Visitor checked in.');
    }

    public function visitorCheckout(int $visitor)
    {
        $this->raw('hostel_visitors')->where('id',$visitor)->whereNull('check_out_at')->update(['check_out_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Visitor checked out.');
    }

    public function meal(Request $request)
    {
        $data=$request->validate(['hostel_allocation_id'=>['required',$this->campusExists('hostel_allocations')],'meal_date'=>'required|date','breakfast'=>'boolean','lunch'=>'boolean','dinner'=>'boolean','amount'=>'required|numeric|min:0']);
        $data+=['breakfast'=>false,'lunch'=>false,'dinner'=>false];
        $this->raw('hostel_meal_allocations')->updateOrInsert(['hostel_allocation_id'=>$data['hostel_allocation_id'],'meal_date'=>$data['meal_date']],$data+['campus_id'=>config('app.active_campus_id'),'status'=>'allocated','created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Meal allocation saved.');
    }

    public function charge(Request $request)
    {
        $data=$request->validate(['hostel_allocation_id'=>['required',$this->campusExists('hostel_allocations')],'type'=>'required|in:security_deposit,damage_charge,meal_charge,other_charge','amount'=>'required|numeric|min:0.01','status'=>'required|in:due,paid,waived,refunded','reference'=>'nullable|string|max:100','notes'=>'nullable|string']);
        $this->ledger($data['hostel_allocation_id'],$data['type'],$data['amount'],$data['status'],$data['notes']??null,$request->user()->id,$data['reference']??null);
        return back()->with('success','Hostel financial entry saved.');
    }

    public function clearance(Request $request, HostelAllocation $allocation)
    {
        $data=$request->validate(['room_cleared'=>'boolean','fees_cleared'=>'boolean','assets_returned'=>'boolean','notes'=>'nullable|string']);
        $charges=(float)$this->raw('hostel_ledger_entries')->where('hostel_allocation_id',$allocation->id)->where('status','due')->whereIn('type',['damage_charge','meal_charge','other_charge'])->sum('amount');
        $deposit=(float)$this->raw('hostel_ledger_entries')->where('hostel_allocation_id',$allocation->id)->where('type','security_deposit')->where('status','paid')->sum('amount');
        $approved=($data['room_cleared']??false)&&($data['fees_cleared']??false)&&($data['assets_returned']??false);
        $this->raw('hostel_clearances')->updateOrInsert(['hostel_allocation_id'=>$allocation->id],$data+['campus_id'=>config('app.active_campus_id'),'status'=>$approved?'approved':'pending','total_due'=>$charges,'deposit_adjusted'=>min($deposit,$charges),'final_payable'=>max(0,$charges-$deposit),'approved_by'=>$approved?$request->user()->id:null,'created_at'=>now(),'updated_at'=>now()]);
        return back()->with('success','Clearance calculation updated.');
    }

    public function settle(Request $request, HostelAllocation $allocation)
    {
        DB::transaction(function() use($allocation,$request){
            $clearance=$this->raw('hostel_clearances')->where('hostel_allocation_id',$allocation->id)->lockForUpdate()->first();
            if(!$clearance || $clearance->status!=='approved') throw ValidationException::withMessages(['clearance'=>'Room, fee and asset clearance must be approved first.']);
            $this->raw('hostel_clearances')->where('id',$clearance->id)->update(['status'=>'settled','settled_at'=>now(),'approved_by'=>$request->user()->id,'updated_at'=>now()]);
            $this->raw('hostel_ledger_entries')->where('hostel_allocation_id',$allocation->id)->where('status','due')->update(['status'=>'paid','paid_at'=>now(),'updated_at'=>now()]);
            if($allocation->hostel_bed_id) HostelBed::whereKey($allocation->hostel_bed_id)->update(['status'=>'available']);
            $allocation->update(['is_active'=>false,'checked_out_at'=>now(),'checkout_notes'=>'Final settlement completed']);
        });
        return back()->with('success','Final settlement and check-out completed.');
    }

    private function ledger($allocation,$type,$amount,$status,$notes,$user,$reference=null): void
    {
        $this->raw('hostel_ledger_entries')->insert(['campus_id'=>config('app.active_campus_id'),'hostel_allocation_id'=>$allocation,'type'=>$type,'amount'=>$amount,'status'=>$status,'reference'=>$reference,'notes'=>$notes,'occurred_at'=>now(),'paid_at'=>$status==='paid'?now():null,'recorded_by'=>$user,'created_at'=>now(),'updated_at'=>now()]);
    }
}
