<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{HostelAllocation, HostelRoomChange, HostelAttendance, HostelVisitor, HostelClearance};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class HostelOperationsController extends Controller
{
    private function campusExists(string $table)
    {
        return Rule::exists($table, 'id')->where(fn($q) => $q->where('campus_id', config('app.active_campus_id')));
    }

    public function index()
    {
        $campusId = config('app.active_campus_id');

        return Inertia::render('Admin/HostelOperations/Index', [
            'allocations' => HostelAllocation::where('campus_id', $campusId)->with(['room', 'bed', 'user'])->get(),
            'roomChanges' => HostelRoomChange::with('hostelAllocation.user')->latest('changed_at')->take(50)->get(),
            'attendances' => HostelAttendance::with('hostelAllocation.user')->latest('attendance_date')->take(50)->get(),
            'visitors' => HostelVisitor::with('hostelAllocation.user')->latest('check_in_at')->take(50)->get(),
            'clearances' => HostelClearance::with('hostelAllocation.user')->latest('settled_at')->take(50)->get(),
        ]);
    }

    public function changeRoom(Request $r)
    {
        $d = $r->validate([
            'hostel_allocation_id' => 'required|exists:hostel_allocations,id',
            'to_room_id' => ['required', $this->campusExists('hostel_rooms')],
            'to_bed_id' => 'required|exists:hostel_beds,id',
            'changed_at' => 'required|date',
            'reason' => 'nullable|string'
        ]);

        $allocation = HostelAllocation::findOrFail($d['hostel_allocation_id']);

        HostelRoomChange::create([
            'hostel_allocation_id' => $allocation->id,
            'from_room_id' => $allocation->hostel_room_id,
            'from_bed_id' => $allocation->hostel_bed_id,
            'to_room_id' => $d['to_room_id'],
            'to_bed_id' => $d['to_bed_id'],
            'changed_at' => $d['changed_at'],
            'reason' => $d['reason'],
            'changed_by' => $r->user()->id,
        ]);

        $allocation->update([
            'hostel_room_id' => $d['to_room_id'],
            'hostel_bed_id' => $d['to_bed_id'],
        ]);

        return back()->with('success', 'Room changed successfully.');
    }

    public function visitor(Request $r)
    {
        $d = $r->validate([
            'hostel_allocation_id' => 'required|exists:hostel_allocations,id',
            'visitor_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'relation' => 'nullable|string|max:100',
            'id_number' => 'nullable|string|max:100',
            'check_in_at' => 'required|date',
            'purpose' => 'nullable|string'
        ]);

        HostelVisitor::create($d + ['approved_by' => $r->user()->id]);

        return back()->with('success', 'Visitor log added.');
    }
}
