<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampusController extends Controller
{
    public function index(Request $request)
    {
        $query = Campus::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('order')->orderBy('name');

        $perPage = $request->get('per_page', 10);
        $campuses = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/School/Index', [
            'campuses' => $perPage === 'all'
                ? ['data' => $campuses, 'links' => [], 'meta' => ['total' => $campuses->count()]]
                : $campuses,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Campus::create($data);

        return back()->with('success', 'নতুন Campus সফলভাবে যোগ করা হয়েছে।');
    }

    public function update(Request $request, Campus $campus)
    {
        $data = $this->validateData($request, $campus->id);
        $campus->update($data);

        return back()->with('success', 'Campus তথ্য সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy(Campus $campus)
    {
        $campus->delete();

        return back()->with('success', 'Campus মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:campuses,code' . ($ignoreId ? ",{$ignoreId}" : ''),
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'established_year' => 'nullable|digits:4',
            'is_main' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);
    }
}
