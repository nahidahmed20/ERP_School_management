<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeGroup::with('feeTypes');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $feeGroups = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/FeesGroups/Index', [
            'feeGroups' => $feeGroups,
            'filters'   => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:fee_groups,name',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        FeeGroup::create($request->all());

        return back()->with('success', 'Fee Group তৈরি সফল হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $group = FeeGroup::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:fee_groups,name,' . $group->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $group->update($request->all());

        return back()->with('success', 'Fee Group আপডেট সফল হয়েছে!');
    }

    public function destroy($id)
    {
        $group = FeeGroup::findOrFail($id);
        $group->delete();

        return back()->with('success', 'Fee Group মুছে ফেলা হয়েছে!');
    }
}
