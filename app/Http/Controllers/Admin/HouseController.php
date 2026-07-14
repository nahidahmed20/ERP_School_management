<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class HouseController extends Controller
{
    public function index(Request $request)
    {
        $query = House::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $houses = $perPage === 'all' 
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]] 
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Houses/Index', [
            'houses' => $houses,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        House::create($data);

        return back()->with('success', 'নতুন House যোগ করা হয়েছে।');
    }

    public function update(Request $request, House $house)
    {
        $data = $this->validateData($request, $house->id);
        $house->update($data);

        return back()->with('success', 'House আপডেট করা হয়েছে।');
    }

    public function destroy(House $house)
    {
        $house->delete();
        return back()->with('success', 'House মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('houses', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}