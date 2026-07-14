<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DesignationController extends Controller
{
    public function index(Request $request)
    {
        $query = Designation::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $designations = $perPage === 'all' 
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]] 
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Designation/Index', [
            'designations' => $designations,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Designation::create($data);

        return back()->with('success', 'নতুন ডিপার্টমেন্ট যোগ করা হয়েছে।');
    }

    public function update(Request $request, Designation $designation)
    {
        $data = $this->validateData($request, $designation->id);
        $designation->update($data);

        return back()->with('success', 'ডিপার্টমেন্ট আপডেট করা হয়েছে।');
    }

    public function destroy(Designation $designation)
    {
        $designation->delete();
        return back()->with('success', 'ডিপার্টমেন্ট মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('designations', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
