<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Guardian, ParentConsent, Student, StudentAuthorizedPickup, StudentClearance, StudentGuardianNote, StudentTransfer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentGuardianOperationsController extends Controller
{
    public function index(Request $request)
    {
        $students = Student::with([
            'currentEnrollment.schoolClass:id,name', 'currentEnrollment.section:id,name', 'guardians',
            'authorizedPickups' => fn ($query) => $query->where('is_active', true)->where(fn ($valid) => $valid->whereNull('valid_until')->orWhereDate('valid_until', '>=', today())),
            'guardianNotes' => fn ($query) => $query->latest()->take(10),
            'parentConsents' => fn ($query) => $query->latest()->take(10),
            'clearances' => fn ($query) => $query->latest(),
        ])->when($request->search, fn ($query, $search) => $query->where(fn ($nested) => $nested->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%")->orWhere('admission_no', 'like', "%{$search}%")))->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Students/FamilyHub', ['students' => $students, 'guardians' => Guardian::latest()->get(['id', 'father_name', 'father_phone', 'mother_name', 'mother_phone', 'guardian_email']), 'filters' => $request->only('search')]);
    }

    public function link(Request $request, Student $student)
    {
        $data = $request->validate(['guardian_id' => 'required|exists:guardians,id', 'relationship' => 'required|string|max:60', 'is_primary' => 'boolean', 'can_pickup' => 'boolean', 'receives_sms' => 'boolean', 'receives_email' => 'boolean', 'custody_note' => 'nullable|string|max:500']);
        $guardian = Guardian::findOrFail($data['guardian_id']);
        abort_unless($guardian->campus_id === $student->campus_id, 422, 'Guardian and student must belong to the same campus.');
        DB::transaction(function () use ($student, $data) {
            if ($data['is_primary']) DB::table('student_guardians')->where('student_id', $student->id)->update(['is_primary' => false]);
            $student->guardians()->syncWithoutDetaching([$data['guardian_id'] => collect($data)->except('guardian_id')->all()]);
            if ($data['is_primary']) $student->update(['guardian_id' => $data['guardian_id']]);
        });
        return back()->with('success', 'Guardian linked to student.');
    }

    public function unlink(Student $student, Guardian $guardian)
    {
        abort_unless($student->guardians()->whereKey($guardian->id)->exists(), 404);
        abort_if($student->guardians()->where('guardians.id', $guardian->id)->wherePivot('is_primary', true)->exists(), 422, 'Set another primary guardian before unlinking this guardian.');
        $student->guardians()->detach($guardian->id);
        return back()->with('success', 'Guardian unlinked.');
    }

    public function pickup(Request $request, Student $student)
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'relationship' => 'required|string|max:80', 'phone' => 'required|string|max:30', 'national_id' => 'nullable|string|max:100', 'valid_until' => 'nullable|date|after_or_equal:today']);
        $student->authorizedPickups()->create($data + ['campus_id' => $student->campus_id, 'created_by' => $request->user()->id]);
        return back()->with('success', 'Authorized pickup person added. Verify the identity before pickup.');
    }

    public function pickupStatus(Request $request, StudentAuthorizedPickup $pickup)
    {
        $data = $request->validate(['is_active' => 'sometimes|boolean', 'is_verified' => 'sometimes|boolean']);
        if (array_key_exists('is_verified', $data)) {
            $data['verified_at'] = $data['is_verified'] ? now() : null;
            $data['verified_by'] = $data['is_verified'] ? $request->user()->id : null;
            unset($data['is_verified']);
        }
        $pickup->update($data);
        return back()->with('success', 'Pickup authorization updated.');
    }

    public function note(Request $request, Student $student)
    {
        $data = $request->validate(['guardian_id' => 'nullable|exists:guardians,id', 'category' => ['required', Rule::in(['general', 'custody', 'communication', 'emergency', 'academic'])], 'note' => 'required|string|max:3000', 'is_confidential' => 'boolean']);
        if (! empty($data['guardian_id'])) abort_unless($student->guardians()->whereKey($data['guardian_id'])->exists(), 422, 'Guardian is not linked to this student.');
        $student->guardianNotes()->create($data + ['campus_id' => $student->campus_id, 'created_by' => $request->user()->id]);
        return back()->with('success', 'Student/guardian note saved.');
    }

    public function consent(Request $request, Student $student)
    {
        $data = $request->validate(['guardian_id' => 'required|exists:guardians,id', 'consent_type' => 'required|string|max:100', 'title' => 'required|string|max:255', 'details' => 'nullable|string|max:5000', 'expires_at' => 'nullable|date|after:now']);
        abort_unless($student->guardians()->whereKey($data['guardian_id'])->exists() || $student->guardian_id === (int) $data['guardian_id'], 422, 'Guardian is not linked to this student.');
        ParentConsent::create($data + ['student_id' => $student->id, 'campus_id' => $student->campus_id, 'assigned_by' => $request->user()->id]);
        return back()->with('success', 'Consent request assigned to guardian.');
    }

    public function clearance(Request $request, StudentClearance $clearance)
    {
        $data = $request->validate(['status' => 'required|in:pending,cleared,blocked', 'amount_due' => 'required|numeric|min:0', 'remarks' => 'nullable|string|max:1000']);
        abort_if($data['status'] === 'cleared' && (float) $data['amount_due'] > 0, 422, 'A clearance with an outstanding amount cannot be marked cleared.');
        DB::transaction(function () use ($request, $clearance, $data) {
            $clearance->update($data + ['cleared_by' => $data['status'] === 'cleared' ? $request->user()->id : null, 'cleared_at' => $data['status'] === 'cleared' ? now() : null]);
            if (! $clearance->student_transfer_id) return;
            $remaining = StudentClearance::where('student_transfer_id', $clearance->student_transfer_id)->where('status', '!=', 'cleared')->exists();
            if (! $remaining) {
                $transfer = StudentTransfer::findOrFail($clearance->student_transfer_id);
                if ($transfer->previous_enrollment_id) DB::table('enrollments')->where('id', $transfer->previous_enrollment_id)->update(['is_current' => false]);
                Student::whereKey($transfer->student_id)->update(['status' => false]);
                $transfer->update(['status' => 'completed', 'approved_by' => $request->user()->id, 'approved_at' => now()]);
            }
        });
        return back()->with('success', 'Clearance updated and finalization checked.');
    }
}
