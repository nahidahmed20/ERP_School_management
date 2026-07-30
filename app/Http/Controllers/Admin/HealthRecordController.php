<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HealthRecord;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HealthRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = HealthRecord::with('user');

        if ($search = $request->get('search')) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('blood_group', 'like', "%{$search}%");
        }

        $records = $query->latest()->paginate(10)->withQueryString();
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

        return Inertia::render('Admin/MedicalHealthRecords/Index', [
            'records' => $records,
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
            'user_id' => 'required|exists:users,id|unique:health_records,user_id',
            'blood_group' => 'nullable|string|max:10',
            'height' => 'nullable|string|max:50',
            'weight' => 'nullable|string|max:50',
            'allergies' => 'nullable|string',
            'chronic_conditions' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:20',
        ]);

        HealthRecord::create($validated);

        return back()->with('success', 'Health record created successfully.');
    }

    public function update(Request $request, $id)
    {
        $record = HealthRecord::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => 'required|exists:users,id|unique:health_records,user_id,' . $id,
            'blood_group' => 'nullable|string|max:10',
            'height' => 'nullable|string|max:50',
            'weight' => 'nullable|string|max:50',
            'allergies' => 'nullable|string',
            'chronic_conditions' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:20',
        ]);

        $record->update($validated);

        return back()->with('success', 'Health record updated successfully.');
    }

    public function destroy($id)
    {
        HealthRecord::findOrFail($id)->delete();
        return back()->with('success', 'Health record deleted successfully.');
    }
}