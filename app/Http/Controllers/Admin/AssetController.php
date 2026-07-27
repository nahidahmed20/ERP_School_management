<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with('assignee');

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('asset_tag', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $assets = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/PurchaseAssets/Index', [
            'assets' => $assets,
            'campuses' => Campus::select('id', 'name')->get(),
            'users' => User::select('id', 'name', 'email')->get(),
            'filters' => $request->only(['search', 'status', 'category', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Asset::create($data);
        return back()->with('success', 'নতুন অ্যাসেট সফলভাবে যুক্ত করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);
        $data = $this->validateData($request, $asset->id);
        $asset->update($data);
        return back()->with('success', 'অ্যাসেটের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        Asset::findOrFail($id)->delete();
        return back()->with('success', 'অ্যাসেট রেকর্ড মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? session('active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'asset_tag' => [
                'required', 'string', 'max:50',
                Rule::unique('assets', 'asset_tag')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'assigned_to' => 'nullable|exists:users,id',
            'location' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
            'status' => 'required|in:Available,Assigned,Maintenance,Damaged,Lost',
            'note' => 'nullable|string',
        ]);
    }
}
