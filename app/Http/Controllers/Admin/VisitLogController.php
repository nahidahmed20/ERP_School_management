<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitLog;
use App\Models\MedicalRoom;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitLogController extends Controller
{
    public function index(Request $request)
    {
        $query = VisitLog::with(['patient', 'room']);

        if ($search = $request->get('search')) {
            $query->whereHas('patient', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('symptoms', 'like', "%{$search}%");
        }

        $logs = $query->latest('visit_time')->paginate(10)->withQueryString();
        
        $rooms = MedicalRoom::where('is_active', true)->select('id', 'room_number')->get();
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

        return Inertia::render('Admin/MedicalVisitLogs/Index', [
            'logs' => $logs,
            'rooms' => $rooms,
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
            'medical_room_id' => 'required|exists:medical_rooms,id',
            'user_id' => 'required|exists:users,id',
            'visit_time' => 'required|date',
            'symptoms' => 'required|string',
            'diagnosis' => 'nullable|string',
            'treatment_given' => 'nullable|string',
            'action_taken' => 'required|string',
        ]);

        VisitLog::create($validated);

        return back()->with('success', 'Visit log added successfully.');
    }

    public function update(Request $request, $id)
    {
        $log = VisitLog::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => 'required|exists:medical_rooms,id',
            'user_id' => 'required|exists:users,id',
            'visit_time' => 'required|date',
            'symptoms' => 'required|string',
            'diagnosis' => 'nullable|string',
            'treatment_given' => 'nullable|string',
            'action_taken' => 'required|string',
        ]);

        $log->update($validated);

        return back()->with('success', 'Visit log updated successfully.');
    }

    public function destroy($id)
    {
        VisitLog::findOrFail($id)->delete();
        return back()->with('success', 'Visit log deleted successfully.');
    }
}