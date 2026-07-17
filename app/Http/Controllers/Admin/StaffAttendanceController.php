<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
            'attendances.*.staff_id' => 'required|exists:staff,id',
            'attendances.*.status' => 'required|in:present,absent,late,half_day',
            'attendances.*.in_time' => 'nullable',
            'attendances.*.out_time' => 'nullable',
            'attendances.*.note' => 'nullable|string|max:255',
        ]);

        $date = $request->date;
        $upsertData = [];

        foreach ($request->attendances as $att) {
            $upsertData[] = [
                'staff_id' => $att['staff_id'],
                'date' => $date,
                'status' => $att['status'],
                'in_time' => $att['status'] === 'absent' ? null : $att['in_time'],
                'out_time' => $att['status'] === 'absent' ? null : $att['out_time'],
                'note' => $att['note'],
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
                ['status', 'in_time', 'out_time', 'note', 'updated_at']
            );

            DB::commit();
            return back()->with('success', 'হাজিরা সফলভাবে সেভ হয়েছে!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'হাজিরা সেভ করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }
}
