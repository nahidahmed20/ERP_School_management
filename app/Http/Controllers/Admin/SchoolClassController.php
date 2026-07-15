<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::with(['sections:id,name', 'subjects:id,name']);

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }
        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('numeric_name', 'asc');

        $perPage = $request->get('per_page', 10);
        $classes = $perPage === 'all' 
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]] 
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'campuses' => Campus::select('id', 'name')->get(),
            'allSections' => Section::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
            'allSubjects' => Subject::select('id', 'name', 'code')->where('is_active', true)->orderBy('name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }
    public function assignSections(Request $request, $id)
    {
        $schoolClass = SchoolClass::findOrFail($id);
        
        $request->validate([
            'sections' => 'array',
            'sections.*' => 'exists:sections,id'
        ]);

        $schoolClass->sections()->sync($request->sections ?? []);

        return back()->with('success', 'Sections assigned successfully.');
    }

    public function assignSubjects(Request $request, $id)
    {
        $schoolClass = SchoolClass::findOrFail($id);
        
        $request->validate([
            'subjects' => 'array',
            'subjects.*' => 'exists:subjects,id'
        ]);

        $schoolClass->subjects()->sync($request->subjects ?? []);

        return back()->with('success', 'Subjects assigned successfully.');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        SchoolClass::create($data);

        return back()->with('success', 'নতুন Class যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $schoolClass = SchoolClass::findOrFail($id);

        $data = $this->validateData($request, $schoolClass->id);

        $schoolClass->update($data);

        return back()->with('success', 'Class আপডেট করা হয়েছে।');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return back()->with('success', 'Class মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('school_classes', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'numeric_name' => 'nullable|integer',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
