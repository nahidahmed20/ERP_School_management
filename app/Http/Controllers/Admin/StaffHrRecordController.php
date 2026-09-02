<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffHrRecord;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffHrRecordController extends Controller
{
    private const TYPES = ['promotion', 'pf', 'gf', 'class_performance', 'training', 'certification', 'award', 'disciplinary', 'transfer'];

    public function index(Request $request)
    {
        $query = StaffHrRecord::with(['staff:id,first_name,last_name,staff_id_no,designation_id', 'staff.designation:id,name'])->latest('record_date');
        if ($request->filled('type')) $query->where('record_type', $request->type);
        if ($request->filled('staff_id')) $query->where('staff_id', $request->staff_id);
        if ($request->filled('search')) $query->where(fn ($q) => $q->where('title', 'like', "%{$request->search}%")->orWhereHas('staff', fn ($s) => $s->where('first_name', 'like', "%{$request->search}%")->orWhere('staff_id_no', 'like', "%{$request->search}%")));

        return Inertia::render('Admin/People/Staff/HrRecords/Index', [
            'records' => $query->paginate(\App\Support\PerPage::resolve(15))->withQueryString(),
            'staffList' => Staff::with('designation:id,name')->where('is_active', true)->orderBy('first_name')->get(['id','first_name','last_name','staff_id_no','designation_id']),
            'filters' => $request->only(['type', 'staff_id', 'search']),
            'summary' => collect(self::TYPES)->mapWithKeys(fn ($type) => [$type => StaffHrRecord::where('record_type', $type)->count()]),
        ]);
    }

    public function store(Request $request)
    {
        StaffHrRecord::create($this->validated($request) + ['campus_id' => config('app.active_campus_id'), 'created_by' => $request->user()->id]);
        return back()->with('success', 'Teacher/Staff HR record added successfully.');
    }

    public function update(Request $request, StaffHrRecord $staff_hr_record)
    {
        $staff_hr_record->update($this->validated($request));
        return back()->with('success', 'Teacher/Staff HR record updated successfully.');
    }

    public function destroy(StaffHrRecord $staff_hr_record)
    {
        $staff_hr_record->delete();
        return back()->with('success', 'Teacher/Staff HR record deleted successfully.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'staff_id' => 'required|exists:staff,id', 'record_type' => ['required', Rule::in(self::TYPES)],
            'record_date' => 'required|date', 'title' => 'required|string|max:255', 'period' => 'nullable|string|max:100',
            'employee_amount' => 'nullable|numeric|min:0', 'employer_amount' => 'nullable|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:100', 'status' => 'required|in:draft,pending,approved,completed,cancelled',
            'details' => 'nullable|array', 'details.*' => 'nullable|string|max:255', 'notes' => 'nullable|string|max:2000',
        ]);
    }
}
