<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{TransportAllocation, TransportPersonnel, TransportRoute, TransportStop, Vehicle, VehicleFuelLog, VehicleMaintenanceLog, TransportPersonnelDocument, StudentBoardingAttendance, TransportFeeCharge, VehicleExpense, TransportVehiclePersonnel};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\Expense;
use App\Services\ExpenseAccountingService;
use App\Services\AccountingService;
use App\Models\Account;

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
            'accounts' => \App\Models\Account::where('is_active', true)->orderBy('code')->get(['id', 'name', 'code', 'type']),
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

    public function fuel(Request $r, ExpenseAccountingService $accounting)
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

        DB::transaction(function () use ($d, $r, $accounting) {
            $d['recorded_by'] = $r->user()->id;
            $fuel = VehicleFuelLog::create($d);
            $amount = round((float) $fuel->litres * (float) $fuel->unit_price, 2);
            if ($amount <= 0) return;
            $expense = Expense::create([
                'campus_id' => (int) $fuel->vehicle->campus_id,
                'expense_head' => 'Transport - Fuel', 'amount' => $amount,
                'expense_date' => $fuel->date, 'description' => trim('Vehicle #'.$fuel->vehicle_id.($fuel->vendor ? ' · '.$fuel->vendor : '').($fuel->receipt_no ? ' · Receipt '.$fuel->receipt_no : '')),
                'expense_account_id' => app(\App\Services\AccountingService::class)->accountForCode('5200', (int) $fuel->vehicle->campus_id)->id,
                'status' => 'unpaid', 'recorded_by' => (string) $r->user()->id, 'created_by' => $r->user()->id,
            ]);
            $accounting->sync($expense);
            $fuel->update(['general_expense_id' => $expense->id]);
        }, 3);

        return back()->with('success', 'Fuel log saved.');
    }

    public function maintenance(Request $r, ExpenseAccountingService $accounting)
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

        DB::transaction(function () use ($d, $r, $accounting) {
            $maintenance = VehicleMaintenanceLog::create($d);
            if ($maintenance->status !== 'completed' || (float) $maintenance->cost <= 0) return;
            $campusId = (int) $maintenance->vehicle->campus_id;
            $expense = Expense::create([
                'campus_id' => $campusId, 'expense_head' => 'Transport - Maintenance: '.$maintenance->type,
                'amount' => $maintenance->cost, 'expense_date' => $maintenance->service_date ?? now()->toDateString(),
                'description' => trim('Vehicle #'.$maintenance->vehicle_id.($maintenance->vendor ? ' · '.$maintenance->vendor : '').($maintenance->notes ? ' · '.$maintenance->notes : '')),
                'expense_account_id' => app(\App\Services\AccountingService::class)->accountForCode('5200', $campusId)->id,
                'status' => 'unpaid', 'recorded_by' => (string) $r->user()->id, 'created_by' => $r->user()->id,
            ]);
            $accounting->sync($expense);
            $maintenance->update(['general_expense_id' => $expense->id]);
        }, 3);

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

    public function expense(Request $r, ExpenseAccountingService $accounting)
    {
        $d = $r->validate([
            'vehicle_id' => ['required', $this->campusExists('vehicles')],
            'date' => 'required|date',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($d, $r, $accounting) {
            $d['recorded_by'] = $r->user()->id;
            $vehicleExpense = VehicleExpense::create($d);
            $campusId = (int) $vehicleExpense->vehicle->campus_id;
            $expenseAccount = app(\App\Services\AccountingService::class)->accountForCode('5200', $campusId);
            $ledgerExpense = Expense::create([
                'campus_id' => $campusId, 'expense_head' => 'Transport - '.$d['category'],
                'amount' => $d['amount'], 'expense_date' => $d['date'],
                'description' => trim('Vehicle #'.$d['vehicle_id'].($d['reference'] ? ' · Ref '.$d['reference'] : '').($d['notes'] ? ' · '.$d['notes'] : '')),
                'expense_account_id' => $expenseAccount->id, 'status' => 'unpaid',
                'recorded_by' => (string) $r->user()->id, 'created_by' => $r->user()->id,
            ]);
            $accounting->sync($ledgerExpense);
            $vehicleExpense->update(['general_expense_id' => $ledgerExpense->id]);
        }, 3);

        return back()->with('success', 'Vehicle expense saved.');
    }

    public function generateFees(Request $r)
    {
        $month = $r->validate(['month' => 'required|date_format:Y-m'])['month'];

        TransportAllocation::where('campus_id', config('app.active_campus_id'))
            ->where('is_active', true)
            ->each(fn($a) => TransportFeeCharge::firstOrCreate(
                ['transport_allocation_id' => $a->id, 'billing_month' => $month],
                ['amount' => $a->monthly_fare, 'status' => 'unpaid']
            ));

        return back()->with('success', 'Monthly transport fees generated.');
    }

    public function payTransportFee(Request $r, TransportFeeCharge $charge, AccountingService $accounting)
    {
        $campusId = (int) config('app.active_campus_id');
        abort_unless($charge->transportAllocation && (int) $charge->transportAllocation->campus_id === $campusId, 404);
        $data = $r->validate([
            'payment_account_id' => ['required', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('campus_id', $campusId)->where('type', 'Asset')->where('is_active', true))],
            'payment_date' => ['required', 'date', 'before_or_equal:today'],
        ]);
        DB::transaction(function () use ($charge, $data, $campusId, $r, $accounting) {
            $charge = TransportFeeCharge::whereKey($charge->id)->lockForUpdate()->firstOrFail();
            if ($charge->general_payment_id) return;
            abort_unless($charge->status === 'unpaid', 422, 'Only unpaid transport fees can be collected.');
            $allocation = $charge->transportAllocation()->with('user')->firstOrFail();
            $account = Account::whereKey($data['payment_account_id'])->where('campus_id', $campusId)->where('type', 'Asset')->firstOrFail();
            $accounting->post('transport-fee:'.$charge->id, $charge, $account, '4000', (float) $charge->amount, 'Transport fee '.$charge->billing_month, $data['payment_date'], 'Receipt');
            $charge->update(['status' => 'paid', 'paid_at' => $data['payment_date']]);
        }, 3);
        return back()->with('success', 'Transport fee received and posted to the selected asset account.');
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
