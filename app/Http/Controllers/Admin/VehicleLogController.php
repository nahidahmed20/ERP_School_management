<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VehicleLogController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        $tab = $request->get('tab', 'fuel'); // fuel, maintenance, expense

        $logs = [];
        
        if ($tab === 'fuel') {
            $logs = DB::table('vehicle_fuel_logs')
                ->join('vehicles', 'vehicles.id', '=', 'vehicle_fuel_logs.vehicle_id')
                ->where('vehicle_fuel_logs.campus_id', $campusId)
                ->select('vehicle_fuel_logs.*', 'vehicles.vehicle_number')
                ->latest('date')->paginate(15)->withQueryString();
        } elseif ($tab === 'maintenance') {
            $logs = DB::table('vehicle_maintenance_logs')
                ->join('vehicles', 'vehicles.id', '=', 'vehicle_maintenance_logs.vehicle_id')
                ->where('vehicle_maintenance_logs.campus_id', $campusId)
                ->select('vehicle_maintenance_logs.*', 'vehicles.vehicle_number')
                ->latest('created_at')->paginate(15)->withQueryString();
        } else {
            $logs = DB::table('vehicle_expenses')
                ->join('vehicles', 'vehicles.id', '=', 'vehicle_expenses.vehicle_id')
                ->where('vehicle_expenses.campus_id', $campusId)
                ->select('vehicle_expenses.*', 'vehicles.vehicle_number')
                ->latest('date')->paginate(15)->withQueryString();
        }

        return Inertia::render('Admin/VehicleLogs/Index', [
            'logs' => $logs,
            'tab' => $tab
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tab = $request->get('tab', 'fuel');
        $table = $tab === 'fuel' ? 'vehicle_fuel_logs' : ($tab === 'maintenance' ? 'vehicle_maintenance_logs' : 'vehicle_expenses');
        
        DB::table($table)->where('id', $id)->where('campus_id', config('app.active_campus_id'))->delete();
        
        return back()->with('success', 'Record deleted successfully.');
    }
}