<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use App\Models\Staff;
use App\Models\StaffLeave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class StaffLeaveController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = StaffLeave::with(['staff.designation', 'leaveType', 'approver'])->latest();

        // Search by Staff Name or ID
        if ($search) {
            $query->whereHas('staff', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('staff_id_no', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($status) {
            $query->where('status', $status);
        }

        $staffLeaves = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/StaffLeaves/Index', [
            'staffLeaves' => $staffLeaves,
            'staffs' => Staff::where('is_active', true)->select('id', 'first_name', 'last_name', 'staff_id_no')->get(),
            'leaveTypes' => LeaveType::where('is_active', true)->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id'      => 'required|exists:staff,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string',
            'attachment'    => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:2048',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $totalDays = $startDate->diffInDays($endDate) + 1;

        $status = 'pending';
        if (auth()->user()->hasRole('Super Admin') && $request->has('status')) {
            $status = $request->status;
        }

        StaffLeave::create([
            'staff_id'      => $request->staff_id,
            'leave_type_id' => $request->leave_type_id,
            'start_date'    => $request->start_date,
            'end_date'      => $request->end_date,
            'total_days'    => $totalDays,
            'reason'        => $request->reason,
            'attachment'    => $attachmentPath,
            'status'        => $status,
            'approved_by'   => $status === 'approved' ? auth()->id() : null,
        ]);

        return back()->with('success', 'ছুটির আবেদন সফলভাবে যোগ করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $leave = StaffLeave::findOrFail($id);

        $request->validate([
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string',
            'attachment'    => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:2048',
        ]);

        $attachmentPath = $leave->attachment;
        if ($request->hasFile('attachment')) {
            if ($leave->attachment && Storage::disk('public')->exists($leave->attachment)) {
                Storage::disk('public')->delete($leave->attachment);
            }
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $totalDays = $startDate->diffInDays($endDate) + 1;

        $status = $leave->status;
        $approvedBy = $leave->approved_by;

        if (auth()->user()->hasRole('Super Admin') && $request->has('status')) {
            $status = $request->status;

            if ($status === 'approved' && $leave->status !== 'approved') {
                $approvedBy = auth()->id();
            } elseif ($status !== 'approved') {
                $approvedBy = null;
            }
        }

        $leave->update([
            'staff_id'      => $request->staff_id ?? $leave->staff_id,
            'leave_type_id' => $request->leave_type_id ?? $leave->leave_type_id,
            'start_date'    => $request->start_date,
            'end_date'      => $request->end_date,
            'total_days'    => $totalDays,
            'reason'        => $request->reason,
            'attachment'    => $attachmentPath,
            'status'        => $status,
            'approved_by'   => $approvedBy,
        ]);

        return back()->with('success', 'ছুটির আবেদন সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $leave = StaffLeave::findOrFail($id);
        if ($leave->attachment && Storage::disk('public')->exists($leave->attachment)) {
            Storage::disk('public')->delete($leave->attachment);
        }
        $leave->delete();

        return back()->with('success', 'ছুটির আবেদনটি মুছে ফেলা হয়েছে!');
    }
}
