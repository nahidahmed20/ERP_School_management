<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransportBoardingController extends Controller
{
    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');
        
        $boardings = DB::table('student_boarding_attendances')
            ->join('transport_allocations', 'transport_allocations.id', '=', 'student_boarding_attendances.transport_allocation_id')
            ->join('users', 'users.id', '=', 'transport_allocations.user_id')
            ->join('vehicles', 'vehicles.id', '=', 'student_boarding_attendances.vehicle_id')
            ->where('student_boarding_attendances.campus_id', $campusId)
            ->select(
                'student_boarding_attendances.*', 
                'users.name as passenger_name', 
                'vehicles.vehicle_number', 
                'transport_allocations.pickup_point'
            )
            ->latest('event_at')
            ->paginate(15);

        return Inertia::render('Admin/TransportBoarding/Index', [
            'boardings' => $boardings
        ]);
    }

    public function destroy($id)
    {
        DB::table('student_boarding_attendances')->where('id', $id)->where('campus_id', config('app.active_campus_id'))->delete();
        return back()->with('success', 'Boarding record deleted.');
    }
}