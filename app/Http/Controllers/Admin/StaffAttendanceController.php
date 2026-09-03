<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\AttendanceDayLock;
use App\Models\AttendancePolicy;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Support\CampusRule;

class StaffAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));

        $staffs = Staff::with(['department', 'designation'])
            ->where('is_active', true)
            ->orderBy('staff_id_no')
            ->get();

        $attendances = StaffAttendance::where('date', $date)
            ->get()
            ->keyBy('staff_id');

        return Inertia::render('Admin/StaffAttendance/Index', [
            'date' => $date,
            'staffs' => $staffs,
            'attendances' => $attendances
        ]);

    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.staff_id' => ['required', CampusRule::exists('staff')],
            'attendances.*.status' => 'required|in:present,absent,late,half_day',
            'attendances.*.in_time' => 'nullable',
            'attendances.*.out_time' => 'nullable',
            'attendances.*.note' => 'nullable|string|max:255',
        ]);

        if (AttendanceDayLock::where('attendance_type','staff')->whereDate('attendance_date',$request->date)->exists()) return back()->with('error','Staff attendance for this date is locked.');
        $policy=AttendancePolicy::where('is_active',true)->first();
        $holiday=Event::where('is_government_holiday',true)->whereDate('start_datetime','<=',$request->date)->whereDate('end_datetime','>=',$request->date)->exists();
        if ($policy?->block_holiday_entry && ($holiday || in_array(\Carbon\Carbon::parse($request->date)->dayOfWeek,$policy->weekly_holidays??[]))) return back()->with('error','Attendance cannot be entered on a configured holiday.');

        $date = $request->date;
        $upsertData = [];

        foreach ($request->attendances as $att) {
            $status=$att['status'];
            if ($status==='present' && $policy && !empty($att['in_time'])) {
                $minutes=\Carbon\Carbon::parse($policy->staff_start_time)->diffInMinutes(\Carbon\Carbon::parse($att['in_time']),false);
                if ($minutes >= $policy->half_day_after_minutes) $status='half_day'; elseif ($minutes > $policy->late_grace_minutes) $status='late';
            }
            $upsertData[] = [
                'campus_id' => config('app.active_campus_id'),
                'staff_id' => $att['staff_id'],
                'date' => $date,
                'status' => $status,
                'in_time' => $att['status'] === 'absent' ? null : $att['in_time'],
                'out_time' => $att['status'] === 'absent' ? null : $att['out_time'],
                'note' => $att['note'],
                'source' => 'manual', 'recorded_by' => $request->user()->id, 'verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::beginTransaction();
        try {
            // Bulk Upsert:

            StaffAttendance::upsert(
                $upsertData,
                ['staff_id', 'date'],
                ['status', 'in_time', 'out_time', 'note', 'source', 'recorded_by', 'verified_at', 'updated_at']
            );

            DB::commit();
            return back()->with('success', 'হাজিরা সফলভাবে সেভ হয়েছে!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'হাজিরা সেভ করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }
}
