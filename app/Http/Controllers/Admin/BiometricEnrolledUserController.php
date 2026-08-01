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
        $query = BiometricEnrolledUser::query();

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
            'campuses' => Campus::select('id', 'name')->get(),
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
            'user_type' => 'required|string',
            'user_id' => 'required|integer',
            'user_name' => 'required|string|max:255',
            'biometric_id' => 'required|string|unique:biometric_enrolled_users,biometric_id',
            'rfid_card_no' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        BiometricEnrolledUser::create($validated);
        return back()->with('success', 'User enrolled successfully.');
    }

    public function update(Request $request, $id)
    {
        $enrolled = BiometricEnrolledUser::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'user_type' => 'required|string',
            'user_id' => 'required|integer',
            'user_name' => 'required|string|max:255',
            'biometric_id' => 'required|string|unique:biometric_enrolled_users,biometric_id,'.$id,
            'rfid_card_no' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $enrolled->update($validated);
        return back()->with('success', 'Enrolled user updated successfully.');
    }

    public function destroy($id)
    {
        BiometricEnrolledUser::findOrFail($id)->delete();
        return back()->with('success', 'Enrolled user deleted.');
    }
}
