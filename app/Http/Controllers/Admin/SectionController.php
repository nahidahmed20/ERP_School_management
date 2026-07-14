<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Section::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('name', 'asc');

        $perPage = $request->get('per_page', 10);

        $sections = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Sections/Index', [
            'sections' => $sections,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Section::create($data);

        return back()->with('success', 'নতুন Section যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        $data = $this->validateData($request, $section->id);

        $section->update($data);

        return back()->with('success', 'Section আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $section = Section::findOrFail($id);
        $section->delete();

        return back()->with('success', 'Section মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('sections', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
