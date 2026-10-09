<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{TransportAllocation, TransportPersonnel, TransportRoute, TransportStop, Vehicle, VehicleFuelLog, VehicleMaintenanceLog, TransportPersonnelDocument, StudentBoardingAttendance, TransportFeeCharge, VehicleExpense, TransportVehiclePersonnel};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TransportOperationsController extends Controller
{
    private function campusExists(string $table)
    {
        return Rule::exists($table, 'id')->where(fn($q) => $q->where('campus_id', config('app.active_campus_id')));
    }

    public function index()
    {
        $campusId = config('app.active_campus_id');

        return Inertia::render('Admin/TransportOperations/Index', [
            'vehicles' => Vehicle::where('campus_id', $campusId)->with('latestLocation')->get(),
            'routes' => TransportRoute::where('campus_id', $campusId)->where('is_active', true)->get(),
            'stops' => TransportStop::orderBy('sequence')->get(),
            'personnel' => TransportPersonnel::where('campus_id', $campusId)->latest()->get(),
            'allocations' => TransportAllocation::where('campus_id', $campusId)->with('user:id,name,email')->where('is_active', true)->get(),

            'fuelLogs' => VehicleFuelLog::latest('date')->take(100)->get(),
            'maintenance' => VehicleMaintenanceLog::latest()->take(100)->get(),
            'documents' => TransportPersonnelDocument::latest()->take(100)->get(),
            'boarding' => StudentBoardingAttendance::latest('event_at')->take(100)->get(),
            'fees' => TransportFeeCharge::latest()->take(100)->get(),
            'expenses' => VehicleExpense::latest('date')->take(100)->get(),

            'summary' => [
                'fuel' => VehicleFuelLog::selectRaw('COALESCE(SUM(litres*unit_price), 0) as total')->value('total') ?? 0,
                'maintenance' => VehicleMaintenanceLog::sum('cost') ?? 0,
                'other' => VehicleExpense::sum('amount') ?? 0
            ]
        ]);
    }

    public function personnel(Request $r)
    {
        $data = $r->validate([
            'type' => 'required|in:driver,helper',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'license_no' => 'nullable|string|max:100',
            'license_expires_at' => 'nullable|date',
            'national_id' => 'nullable|string|max:100'
        ]);

        $data['campus_id'] = config('app.active_campus_id');
        TransportPersonnel::create($data);

        return back()->with('success', 'Driver/helper saved successfully.');
    }

    public function assign(Request $r)
    {
        $d = $r->validate([
            'vehicle_id' => ['required', $this->campusExists('vehicles')],
            'transport_personnel_id' => ['required', $this->campusExists('transport_personnel')],
            'assigned_from' => 'required|date',
            'assigned_until' => 'nullable|date|after_or_equal:assigned_from'
        ]);

        TransportVehiclePersonnel::create($d);

        return back()->with('success', 'Personnel assigned to vehicle.');
    }

    public function stop(Request $r)
    {
        $data = $r->validate([
            'transport_route_id' => ['required', $this->campusExists('transport_routes')],
            'name' => 'required|string|max:255',
            'sequence' => 'required|integer|min:1',
            'pickup_time' => 'nullable',
            'drop_time' => 'nullable',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'geofence_radius_m' => 'required|integer|min:20|max:5000',
            'monthly_fare' => 'required|numeric|min:0'
        ]);

        TransportStop::create($data);

        return back()->with('success', 'Route stop and schedule saved.');
    }

    public function fuel(Request $r)
    {
        $d = $r->validate([
            'vehicle_id' => ['required', $this->campusExists('vehicles')],
            'date' => 'required|date',
            'litres' => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
            'odometer' => 'nullable|numeric|min:0',
            'vendor' => 'nullable|string|max:255',
            'receipt_no' => 'nullable|string|max:100'
        ]);

        $d['recorded_by'] = $r->user()->id;
        VehicleFuelLog::create($d);

        return back()->with('success', 'Fuel log saved.');
    }

    public function maintenance(Request $r)
    {
        $d = $r->validate([
            'vehicle_id' => ['required', $this->campusExists('vehicles')],
            'type' => 'required|string|max:100',
            'service_date' => 'nullable|date',
            'next_due_date' => 'nullable|date',
            'next_due_odometer' => 'nullable|numeric|min:0',
            'cost' => 'numeric|min:0',
            'vendor' => 'nullable|string|max:255',
            'status' => 'required|in:scheduled,in_progress,completed',
            'notes' => 'nullable|string'
        ]);

        VehicleMaintenanceLog::create($d);

        return back()->with('success', 'Maintenance record saved.');
    }

    public function document(Request $r)
    {
        $d = $r->validate([
            'transport_personnel_id' => ['required', $this->campusExists('transport_personnel')],
            'type' => 'required|string|max:100',
            'number' => 'nullable|string|max:100',
            'expires_at' => 'nullable|date',
            'file' => 'nullable|file|max:5120'
        ]);

        $d['file_path'] = $r->hasFile('file') ? $r->file('file')->store('transport/documents/' . config('app.active_campus_id'), 'local') : null;
        unset($d['file']);

        TransportPersonnelDocument::create($d);

        return back()->with('success', 'Personnel document saved.');
    }

    public function boarding(Request $r)
    {
        $d = $r->validate([
            'transport_allocation_id' => ['required', $this->campusExists('transport_allocations')],
            'trip_date' => 'required|date',
            'trip_type' => 'required|in:pickup,drop',
            'event' => 'required|in:boarded,dropped,absent',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric'
        ]);

        $a = TransportAllocation::findOrFail($d['transport_allocation_id']);

        StudentBoardingAttendance::updateOrCreate(
            collect($d)->only(['transport_allocation_id', 'trip_date', 'trip_type', 'event'])->all(),
            $d + [
                'vehicle_id' => $a->vehicle_id,
                'event_at' => now(),
                'source' => 'manual',
                'recorded_by' => $r->user()->id
            ]
        );

        $this->notify($a, $d['event'], $d['trip_type']);

        return back()->with('success', 'Boarding recorded and guardian notified.');
    }

    public function token(Vehicle $vehicle)
    {
        $token = bin2hex(random_bytes(24));
        $vehicle->update(['tracking_token_hash' => hash('sha256', $token)]);
        return back()->with('success', 'GPS token (copy now): ' . $token);
    }

    public function expense(Request $r)
    {
        $d = $r->validate([
            'vehicle_id' => ['required', $this->campusExists('vehicles')],
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        $d['recorded_by'] = $r->user()->id;
        VehicleExpense::create($d);

        return back()->with('success', 'Vehicle expense saved.');
    }

    public function generateFees(Request $r)
    {
        $month = $r->validate(['month' => 'required|date_format:Y-m'])['month'];

        TransportAllocation::where('campus_id', config('app.active_campus_id'))
            ->where('is_active', true)
            ->each(fn($a) => TransportFeeCharge::updateOrCreate(
                ['transport_allocation_id' => $a->id, 'billing_month' => $month],
                ['amount' => $a->monthly_fare, 'status' => 'unpaid']
            ));

        return back()->with('success', 'Monthly transport fees generated.');
    }

    private function notify($a, $event, $trip)
    {
        try {
            $u = $a->user;
            $s = $u?->student;
            $phone = $s?->guardian?->father_phone;

            if ($phone && class_exists('\App\Services\SmsService')) {
                \App\Services\SmsService::send($phone, "Transport update: {$u->name} was {$event} for {$trip} at " . now()->format('h:i A') . '.', [
                    'category' => 'transport',
                    'reference_key' => 'transport:' . $a->id . ':' . $trip . ':' . $event . ':' . today()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('SMS Notification failed: ' . $e->getMessage());
        }
    }
}
