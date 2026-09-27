<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitLog;
use App\Models\MedicalRoom;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;

class VisitLogController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        $query = VisitLog::with(['patient.roles', 'room'])->where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->whereHas('patient', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('symptoms', 'like', "%{$search}%");
        }

        $logs = $query->latest('visit_time')->paginate(\App\Support\PerPage::resolve())->withQueryString();
        
        $rooms = MedicalRoom::where('campus_id', $activeCampusId)->where('is_active', true)->select('id', 'room_number')->get();
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

        return Inertia::render('Admin/MedicalVisitLogs/Index', [
            'logs' => $logs,
            'rooms' => $rooms,
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
            'medical_room_id' => ['required', CampusRule::exists('medical_rooms')],
            'user_id' => ['required', CampusRule::exists('users')],
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
        $log = VisitLog::where('campus_id', config('app.active_campus_id'))->findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'medical_room_id' => ['required', CampusRule::exists('medical_rooms')],
            'user_id' => ['required', CampusRule::exists('users')],
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
        VisitLog::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        return back()->with('success', 'Visit log deleted successfully.');
    }
}