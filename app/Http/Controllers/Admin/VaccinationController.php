<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vaccination;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;

class VaccinationController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        $query = Vaccination::with('user.roles')->where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('vaccine_name', 'like', "%{$search}%");
        }

        $vaccinations = $query->latest('date_administered')->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        $users = User::where('campus_id', $activeCampusId)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['Student', 'Teacher', 'Staff', 'student', 'teacher', 'staff']);
            })
            ->with(['roles', 'student', 'staff'])->get()->map(function ($user) {
                
                $roleName = $user->roles->first()?->name ?? 'User';
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
            'activeCampusId' => $activeCampusId,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => ['required', CampusRule::exists('users')],
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
        $vaccination = Vaccination::where('campus_id', config('app.active_campus_id'))->findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => ['required', CampusRule::exists('users')],
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
        Vaccination::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        
        return back()->with('success', 'Vaccination record deleted successfully.');
    }
}