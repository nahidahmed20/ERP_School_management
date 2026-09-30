<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{BiometricEnrolledUser, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class BiometricEnrolledUserController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');
        $query = BiometricEnrolledUser::where(function ($q) use ($activeCampusId) {
            $q->where('campus_id', $activeCampusId)
                ->orWhereNull('campus_id');
        });

        if ($search = $request->get('search')) {
            $query->where('user_name', 'like', "%{$search}%")
                ->orWhere('biometric_id', 'like', "%{$search}%")
                ->orWhere('rfid_card_no', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $enrolled = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $enrolled = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Biometric/EnrolledUsers/Index', [
            'enrolledUsers' => $enrolled,
            'campuses' => Campus::when(! $request->user()->hasRole('Super Admin'), fn($q) => $q->whereKey(config('app.active_campus_id')))->select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'user_type' => 'required|in:staff,student',
            'user_id' => 'required|integer',
            'user_name' => 'required|string|max:255',
            'biometric_id' => 'required|string|unique:biometric_enrolled_users,biometric_id',
            'rfid_card_no' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
        $validated['campus_id'] = config('app.active_campus_id');
        $table = $validated['user_type'] === 'staff' ? 'staff' : 'students';
        if (!\DB::table($table)->where('id', $validated['user_id'])->where('campus_id', $validated['campus_id'])->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'user_id' => 'Selected user ID does not belong to the active campus for this user type.',
            ]);
        }

        BiometricEnrolledUser::create($validated);
        return back()->with('success', 'User enrolled successfully.');
    }

    public function update(Request $request, $id)
    {
        $enrolled = BiometricEnrolledUser::where('campus_id', config('app.active_campus_id'))->orWhereNull('campus_id')->findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'user_type' => 'required|in:staff,student',
            'user_id' => 'required|integer',
            'user_name' => 'required|string|max:255',
            'biometric_id' => 'required|string|unique:biometric_enrolled_users,biometric_id,' . $id,
            'rfid_card_no' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
        $validated['campus_id'] = config('app.active_campus_id');
        $table = $validated['user_type'] === 'staff' ? 'staff' : 'students';
        if (!\DB::table($table)->where('id', $validated['user_id'])->where('campus_id', $validated['campus_id'])->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'user_id' => 'Selected user ID does not belong to the active campus for this user type.',
            ]);
        }

        $enrolled->update($validated);
        return back()->with('success', 'Enrolled user updated successfully.');
    }

    public function destroy($id)
    {
        BiometricEnrolledUser::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        return back()->with('success', 'Enrolled user deleted.');
    }
}
