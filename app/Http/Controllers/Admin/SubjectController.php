<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query();

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('name', 'asc');

        $perPage = $request->get('per_page', 10);

        $subjects = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'type', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Subject::create($data);

        return back()->with('success', 'নতুন Subject যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);
        $data = $this->validateData($request, $subject->id);

        $subject->update($data);

        return back()->with('success', 'Subject আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return back()->with('success', 'Subject মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('subjects', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('subjects', 'code')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'type' => 'required|in:Theory,Practical,Both',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
