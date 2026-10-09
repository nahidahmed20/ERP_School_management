<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{MedicalRoom, HealthRecord, MedicineStock, Vaccination, MedicalConsent, MedicineIssue, DoctorAppointment, MedicalEmergencyAlert, MedicalDocument, User};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class MedicalOperationsController extends Controller
{
    private function campusExists(string $table)
    {
        return Rule::exists($table, 'id')->where(fn($q) => $q->where('campus_id', config('app.active_campus_id')));
    }

    public function index()
    {
        $campusId = config('app.active_campus_id');

        return Inertia::render('Admin/MedicalOperations/Index', [
            'rooms' => MedicalRoom::where('campus_id', $campusId)->get(),
            'medicineStocks' => MedicineStock::where('campus_id', $campusId)->get(),
            'alerts' => MedicalEmergencyAlert::with('user')->latest('occurred_at')->take(20)->get(),
            'appointments' => DoctorAppointment::with('user')->orderBy('scheduled_at', 'desc')->take(20)->get(),
            'issues' => MedicineIssue::with(['user', 'medicineStock'])->latest('issued_at')->take(20)->get(),
            'students' => User::where('campus_id', $campusId)->where('role', 'student')->select('id', 'name')->get(),
        ]);
    }

    public function issueMedicine(Request $r)
    {
        $d = $r->validate([
            'medicine_stock_id' => ['required', $this->campusExists('medicine_stocks')],
            'user_id' => ['required', $this->campusExists('users')],
            'quantity' => 'required|integer|min:1',
            'dosage' => 'nullable|string',
            'reason' => 'nullable|string',
        ]);

        $stock = MedicineStock::findOrFail($d['medicine_stock_id']);
        
        if ($stock->quantity < $d['quantity']) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $stock->decrement('quantity', $d['quantity']);

        MedicineIssue::create($d + [
            'issued_at' => now(),
            'issued_by' => $r->user()->id
        ]);

        return back()->with('success', 'Medicine issued successfully.');
    }

    public function bookAppointment(Request $r)
    {
        $d = $r->validate([
            'user_id' => ['required', $this->campusExists('users')],
            'doctor_name' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'location' => 'nullable|string',
            'reason' => 'nullable|string'
        ]);

        DoctorAppointment::create($d + [
            'status' => 'scheduled',
            'created_by' => $r->user()->id
        ]);

        return back()->with('success', 'Doctor appointment scheduled.');
    }

    public function reportEmergency(Request $r)
    {
        $d = $r->validate([
            'user_id' => ['required', $this->campusExists('users')],
            'severity' => 'required|in:low,medium,high,critical',
            'message' => 'required|string',
            'location' => 'nullable|string',
        ]);

        MedicalEmergencyAlert::create($d + [
            'occurred_at' => now(),
            'reported_by' => $r->user()->id
        ]);

        return back()->with('success', 'Emergency alert reported.');
    }
}