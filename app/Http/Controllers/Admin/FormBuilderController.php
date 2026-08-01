<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{FormBuilder, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormBuilderController extends Controller
{
    public function index(Request $request)
    {
        $query = FormBuilder::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $forms = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $forms = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Workflow/Builder/Index', [
            'forms' => $forms,
            'filters' => ['search' => $search, 'per_page' => $perPageRaw],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/System/Workflow/Builder/FormEditor', [
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'form_schema' => 'nullable|array', // JSON array of fields
            'is_published' => 'boolean',
        ]);

        FormBuilder::create($validated);
        return redirect()->route('admin.workflow.builder.index')->with('success', 'Form built successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/System/Workflow/Builder/FormEditor', [
            'item' => FormBuilder::findOrFail($id),
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $form = FormBuilder::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'form_schema' => 'nullable|array',
            'is_published' => 'boolean',
        ]);

        $form->update($validated);
        return redirect()->route('admin.workflow.builder.index')->with('success', 'Form updated successfully.');
    }

    public function destroy($id)
    {
        FormBuilder::findOrFail($id)->delete();
        return back()->with('success', 'Form deleted.');
    }
}
