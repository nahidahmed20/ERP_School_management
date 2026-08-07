<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{StaffAppraisal, Staff};
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffAppraisalController extends Controller
{
    public function index(Request $request)
    {
        $query = StaffAppraisal::with(['staff:id,first_name,last_name,staff_id_no,designation_id', 'evaluator:id,name']);

        if ($search = $request->get('search')) {
            $query->whereHas('staff', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('staff_id_no', 'like', "%{$search}%");
            });
        }

        $appraisals = $query->latest('appraisal_date')->paginate(15)->withQueryString();

        return Inertia::render('Admin/People/Staff/Appraisals/Index', [
            'appraisals' => $appraisals,
            'staffList' => Staff::with('designation')->where('is_active', true)->get(),
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'appraisal_date' => 'required|date',
            'period' => 'required|string|max:100',
            'rating' => 'required|numeric|min:1|max:5',
            'remarks' => 'nullable|string',
        ]);

        $validated['evaluated_by'] = auth()->id();

        StaffAppraisal::create($validated);
        return back()->with('success', 'Performance appraisal saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $appraisal = StaffAppraisal::findOrFail($id);
        
        $validated = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'appraisal_date' => 'required|date',
            'period' => 'required|string|max:100',
            'rating' => 'required|numeric|min:1|max:5',
            'remarks' => 'nullable|string',
        ]);

        $validated['evaluated_by'] = auth()->id(); // Update the evaluator to current user

        $appraisal->update($validated);
        return back()->with('success', 'Performance appraisal updated.');
    }

    public function destroy($id)
    {
        StaffAppraisal::findOrFail($id)->delete();
        return back()->with('success', 'Appraisal record deleted successfully.');
    }
}