<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{WorkflowCustomField, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CustomFieldController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkflowCustomField::query();

        if ($search = $request->get('search')) {
            $query->where('field_label', 'like', "%{$search}%")
                  ->orWhere('target_model', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $fields = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $fields = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Workflow/CustomFields/Index', [
            'customFields' => $fields,
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
            'target_model' => 'required|string',
            'field_label' => 'required|string|max:255',
            'field_type' => 'required|string',
            'options' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['field_name'] = Str::snake($validated['field_label']);

        WorkflowCustomField::create($validated);
        return back()->with('success', 'Custom Field added successfully.');
    }

    public function update(Request $request, $id)
    {
        $field = WorkflowCustomField::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'target_model' => 'required|string',
            'field_label' => 'required|string|max:255',
            'field_type' => 'required|string',
            'options' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['field_name'] = Str::snake($validated['field_label']);

        $field->update($validated);
        return back()->with('success', 'Custom Field updated.');
    }

    public function destroy($id)
    {
        WorkflowCustomField::findOrFail($id)->delete();
        return back()->with('success', 'Custom Field deleted.');
    }
}
