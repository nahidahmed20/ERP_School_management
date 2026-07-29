<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssetMaintenance;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetMaintenance::with('asset');

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('service_provider', 'like', "%{$search}%")
                  ->orWhereHas('asset', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $maintenances = $query->latest('start_date')->paginate($request->per_page ?? 10)->withQueryString();

        $assets = Asset::select('id', 'name')->get();

        return Inertia::render('Admin/PurchaseAssetMaintenance/Index', [
            'maintenances' => $maintenances,
            'assets' => $assets,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'title' => 'required|string|max:255',
            'maintenance_type' => 'required|string|max:255',
            'service_provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:Pending,In Progress,Completed,Cancelled',
            'details' => 'nullable|string',
        ]);

        AssetMaintenance::create($request->all());

        return back()->with('success', 'মেইনটেন্যান্স রেকর্ড সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $maintenance = AssetMaintenance::findOrFail($id);

        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'title' => 'required|string|max:255',
            'maintenance_type' => 'required|string|max:255',
            'service_provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:Pending,In Progress,Completed,Cancelled',
            'details' => 'nullable|string',
        ]);

        $maintenance->update($request->all());

        return back()->with('success', 'রেকর্ড আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,In Progress,Completed,Cancelled']);

        $maintenance = AssetMaintenance::findOrFail($id);

        $data = ['status' => $request->status];
        if ($request->status === 'Completed' && !$maintenance->end_date) {
            $data['end_date'] = now();
        }

        $maintenance->update($data);

        return back()->with('success', 'স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        AssetMaintenance::findOrFail($id)->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
