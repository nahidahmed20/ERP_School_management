<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeGroup;
use App\Models\FeeType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeTypeController extends Controller
{
    public function index(Request $request, FeeGroup $feeGroup)
    {
        $query = $feeGroup->feeTypes();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $feeTypes = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/FeesTypes/Index', [
            'feeGroup' => $feeGroup,
            'feeTypes' => $feeTypes,
            'filters'  => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request, FeeGroup $feeGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $feeGroup->feeTypes()->create($validated);

        return back()->with('success', 'Fee Type সফলভাবে যোগ করা হয়েছে!');
    }

    public function update(Request $request, FeeType $feeType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $feeType->update($validated);

        return back()->with('success', 'Fee Type আপডেট করা হয়েছে!');
    }

    public function destroy(FeeType $feeType)
    {
        $feeType->delete();
        return back()->with('success', 'Fee Type মুছে ফেলা হয়েছে!');
    }
}
