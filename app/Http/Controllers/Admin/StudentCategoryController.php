<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentCategory;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StudentCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentCategory::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);

        $categories = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/StudentCategories/Index', [
            'categories' => $categories,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        StudentCategory::create($data);

        return back()->with('success', 'নতুন Student Category যোগ করা হয়েছে।');
    }

    public function update(Request $request, StudentCategory $studentCategory)
    {
        $data = $this->validateData($request, $studentCategory->id);
        $studentCategory->update($data);

        return back()->with('success', 'Student Category আপডেট করা হয়েছে।');
    }

    public function destroy(StudentCategory $studentCategory)
    {
        $studentCategory->delete();
        return back()->with('success', 'Student Category মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('student_categories', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
