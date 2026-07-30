<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vaccination;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VaccinationController extends Controller
{
    public function index(Request $request)
    {
        $query = Vaccination::with('student');

        if ($search = $request->get('search')) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('vaccine_name', 'like', "%{$search}%");
        }

        $vaccinations = $query->latest('date_administered')->paginate(10)->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        // Spatie & Staff/Student Relation Data 
        $users = User::with(['roles', 'student', 'staff'])->get()->map(function ($user) {
            $roleName = $user->roles->first()->name ?? 'User';
            $displayName = $user->name;
            if ($user->student) {
                $displayName = trim($user->student->first_name . ' ' . $user->student->last_name) . ' (' . $user->student->admission_no . ')';
                $roleName = 'Student';
            } elseif ($user->staff) {
                $displayName = trim($user->staff->first_name . ' ' . $user->staff->last_name) . ' (' . $user->staff->staff_id_no . ')';
            }
            return ['id' => $user->id, 'name' => $displayName, 'role' => ucfirst($roleName)];
        });

        return Inertia::render('Admin/MedicalVaccinations/Index', [
            'vaccinations' => $vaccinations,
            'users' => $users,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => 'required|exists:users,id',
            'vaccine_name' => 'required|string|max:255',
            'dose_number' => 'nullable|string|max:50',
            'date_administered' => 'required|date',
            'next_due_date' => 'nullable|date|after_or_equal:date_administered',
            'remarks' => 'nullable|string',
        ]);

        Vaccination::create($validated);

        return back()->with('success', 'Vaccination record added successfully.');
    }

    public function update(Request $request, $id)
    {
        $vaccination = Vaccination::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => 'required|exists:users,id',
            'vaccine_name' => 'required|string|max:255',
            'dose_number' => 'nullable|string|max:50',
            'date_administered' => 'required|date',
            'next_due_date' => 'nullable|date|after_or_equal:date_administered',
            'remarks' => 'nullable|string',
        ]);

        $vaccination->update($validated);

        return back()->with('success', 'Vaccination record updated successfully.');
    }

    public function destroy($id)
    {
        Vaccination::findOrFail($id)->delete();
        return back()->with('success', 'Vaccination record deleted successfully.');
    }
}