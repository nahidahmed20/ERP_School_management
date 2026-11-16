<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HostelRecordController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        $tab = $request->get('tab', 'ledger'); 

        $records = [];
        
        if ($tab === 'ledger') {
            $records = DB::table('hostel_ledger_entries')
                ->join('hostel_allocations', 'hostel_allocations.id', '=', 'hostel_ledger_entries.hostel_allocation_id')
                ->join('users', 'users.id', '=', 'hostel_allocations.user_id')
                ->where('hostel_ledger_entries.campus_id', $campusId)
                ->select('hostel_ledger_entries.*', 'users.name as resident_name')
                ->latest('occurred_at')->paginate(15)->withQueryString();
                
        } elseif ($tab === 'attendance') {
            $records = DB::table('hostel_attendances')
                ->join('hostel_allocations', 'hostel_allocations.id', '=', 'hostel_attendances.hostel_allocation_id')
                ->join('users', 'users.id', '=', 'hostel_allocations.user_id')
                ->where('hostel_attendances.campus_id', $campusId)
                ->select('hostel_attendances.*', 'users.name as resident_name')
                ->latest('attendance_date')->paginate(15)->withQueryString();
                
        } elseif ($tab === 'meals') {
            $records = DB::table('hostel_meal_allocations')
                ->join('hostel_allocations', 'hostel_allocations.id', '=', 'hostel_meal_allocations.hostel_allocation_id')
                ->join('users', 'users.id', '=', 'hostel_allocations.user_id')
                ->where('hostel_meal_allocations.campus_id', $campusId)
                ->select('hostel_meal_allocations.*', 'users.name as resident_name')
                ->latest('meal_date')->paginate(15)->withQueryString();
                
        } else {
            $records = DB::table('hostel_visitors')
                ->join('hostel_allocations', 'hostel_allocations.id', '=', 'hostel_visitors.hostel_allocation_id')
                ->join('users', 'users.id', '=', 'hostel_allocations.user_id')
                ->where('hostel_visitors.campus_id', $campusId)
                ->select('hostel_visitors.*', 'users.name as resident_name')
                ->latest('check_in_at')->paginate(15)->withQueryString();
        }

        return Inertia::render('Admin/HostelRecords/Index', [
            'records' => $records,
            'tab' => $tab
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tab = $request->get('tab', 'ledger');
        
        $tableMapping = [
            'ledger' => 'hostel_ledger_entries',
            'attendance' => 'hostel_attendances',
            'meals' => 'hostel_meal_allocations',
            'visitors' => 'hostel_visitors'
        ];
        
        $table = $tableMapping[$tab];
        
        DB::table($table)->where('id', $id)->where('campus_id', config('app.active_campus_id'))->delete();
        
        return back()->with('success', 'Record deleted successfully.');
    }
}