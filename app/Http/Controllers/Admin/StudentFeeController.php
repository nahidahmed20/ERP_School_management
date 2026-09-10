<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\FeeAssignment;
use App\Models\FeeGroup;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Services\FeeAutomationService;
use App\Support\CampusRule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentFeeController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'class_id' => ['nullable', CampusRule::exists('school_classes')],
            'section_id' => ['nullable', CampusRule::exists('sections')],
        ]);
        if ($request->filled('section_id') && ! SchoolClass::find($request->class_id)?->sections()->whereKey($request->section_id)->exists()) {
            throw ValidationException::withMessages(['section_id' => 'Select a section assigned to this class.']);
        }
        $students = [];
        if ($request->filled('class_id')) {
            $students = Student::with([
                'currentEnrollment.schoolClass', 'currentEnrollment.section', 'feeAssignments.feeGroup',
            ])->whereHas('currentEnrollment', function ($query) use ($request) {
                $query->where('class_id', $request->class_id)
                    ->when($request->filled('section_id'), fn ($q) => $q->where('section_id', $request->section_id));
            })->get();
        }

        return Inertia::render('Admin/FeesStudentFees/Index', [
            'students' => $students,
            'classes' => SchoolClass::with('sections')->where('is_active', true)->get(),
            'feeGroups' => FeeGroup::where('is_active', true)->get(),
            'filters' => $request->only(['class_id', 'section_id']),
        ]);
    }

    public function store(Request $request, FeeAutomationService $automation)
    {
        $data = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => ['required', 'integer', 'distinct', CampusRule::exists('students')],
            // Fee groups are a shared catalog and do not have a campus_id column.
            'fee_group_id' => ['required', Rule::exists('fee_groups', 'id')->where('is_active', true)],
            'due_date' => 'required|date',
            'amount' => 'nullable|numeric|min:0',
            'billing_frequency' => 'required|in:one_time,monthly,quarterly,yearly',
            'ends_on' => 'nullable|date|after_or_equal:due_date',
            'discount_type' => 'required|in:none,fixed,percentage',
            'discount_value' => ['required', 'numeric', 'min:0', ...($request->discount_type === 'percentage' ? ['max:100'] : [])],
            'late_fee_type' => 'required|in:none,fixed,percentage',
            'late_fee_value' => ['required', 'numeric', 'min:0', ...($request->late_fee_type === 'percentage' ? ['max:100'] : [])],
            'grace_days' => 'required|integer|min:0|max:365',
        ]);

        $session = AcademicSession::where('campus_id', config('app.active_campus_id'))
            ->where('is_current', true)->first();
        if (! $session) {
            throw ValidationException::withMessages(['student_ids' => 'Set a current academic session for this campus before assigning fees.']);
        }

        $created = DB::transaction(function () use ($data, $session, $automation) {
            $created = 0;
            // Lock the parent rows so concurrent requests cannot create duplicate assignments.
            $students = Student::whereIn('id', $data['student_ids'])->orderBy('id')->lockForUpdate()->get();
            foreach ($students as $student) {
                $assignment = FeeAssignment::firstOrCreate([
                    'student_id' => $student->id,
                    'fee_group_id' => $data['fee_group_id'],
                    'academic_session_id' => $session->id,
                ], [
                    'campus_id' => $student->campus_id,
                    'due_date' => $data['due_date'],
                    'status' => 'unpaid',
                    'amount' => $data['amount'] ?? null,
                    'billing_frequency' => $data['billing_frequency'],
                    'starts_on' => $data['due_date'],
                    'ends_on' => $data['ends_on'] ?? null,
                    'next_invoice_date' => $data['due_date'],
                    'discount_type' => $data['discount_type'],
                    'discount_value' => $data['discount_value'],
                    'late_fee_type' => $data['late_fee_type'],
                    'late_fee_value' => $data['late_fee_value'],
                    'grace_days' => $data['grace_days'],
                    'is_active' => true,
                ]);
                if ($assignment->wasRecentlyCreated) {
                    $created++;
                    // Make the initial invoice available immediately, including advance collection.
                    $automation->generateAssignment($assignment->id, Carbon::parse($data['due_date'])->max(today()));
                }
            }

            return $created;
        }, 3);

        $skipped = count($data['student_ids']) - $created;
        return back()->with('success', "{$created} fee assignment(s) created; {$skipped} existing assignment(s) preserved.");
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            $assignment = FeeAssignment::whereKey($id)->lockForUpdate()->firstOrFail();
            $invoices = $assignment->invoices()->lockForUpdate()->get();
            if ($assignment->payments()->exists() || $invoices->contains(fn ($invoice) =>
                (float) $invoice->paid_amount > 0 || $invoice->paymentAllocations()->exists()
            )) {
                throw ValidationException::withMessages(['assignment' => 'This assignment has payment history and cannot be revoked.']);
            }
            // Keep issued invoices as cancelled records for audit and prevent later collection.
            $assignment->invoices()->update(['status' => 'Cancelled']);
            $assignment->update(['is_active' => false, 'next_invoice_date' => null, 'status' => 'paid']);
        }, 3);

        return back()->with('success', 'Fee assignment revoked and its unpaid invoices cancelled.');
    }
}
