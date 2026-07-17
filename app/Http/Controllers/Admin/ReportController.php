<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $staffs = Staff::select('id', 'first_name', 'last_name', 'staff_id_no')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Admin/Report/AttendanceReport', [
            'staffs' => $staffs,
            'reportData' => null,
            'reportType' => null,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:single,all',
            'staff_id' => 'required_if:report_type,single',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        $query = StaffAttendance::with('staff:id,first_name,last_name,staff_id_no')
                    ->whereBetween('date', [$request->from_date, $request->to_date])
                    ->orderBy('date', 'asc');

        if ($request->report_type === 'single') {
            $query->where('staff_id', $request->staff_id);
            $reportData = $query->get();
        } else {
            $reportData = $query->get()->groupBy('staff_id');
        }

        return Inertia::render('Admin/Report/AttendanceReport', [
            'staffs' => Staff::select('id', 'first_name', 'last_name', 'staff_id_no')->where('is_active', true)->get(),
            'reportData' => $reportData,
            'reportType' => $request->report_type,
            'filters' => $request->only(['report_type', 'staff_id', 'from_date', 'to_date'])
        ]);
    }
}
