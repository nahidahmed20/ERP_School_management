<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssetAssignment;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetAssignment::with('asset');

        if ($search = $request->search) {
            $query->where('assignee_name', 'like', "%{$search}%")
                  ->orWhereHas('asset', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assignments = $query->latest('assigned_date')->paginate($request->per_page ?? 10)->withQueryString();

        $assets = Asset::select('id', 'name')->get();

        return Inertia::render('Admin/PurchaseAssetAssignments/Index', [
            'assignments' => $assignments,
            'assets' => $assets,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'assignee_name' => 'required|string|max:255',
            'assigned_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:assigned_date',
            'status' => 'required|in:Assigned,Returned,Damaged,Lost',
            'note' => 'nullable|string',
        ]);

        AssetAssignment::create($request->all());

        return back()->with('success', 'অ্যাসেট সফলভাবে অ্যাসাইন করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $assignment = AssetAssignment::findOrFail($id);

        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'assignee_name' => 'required|string|max:255',
            'assigned_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:assigned_date',
            'returned_date' => 'nullable|date',
            'status' => 'required|in:Assigned,Returned,Damaged,Lost',
            'note' => 'nullable|string',
        ]);

        $assignment->update($request->all());

        return back()->with('success', 'অ্যাসাইনমেন্ট আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Assigned,Returned,Damaged,Lost']);

        $assignment = AssetAssignment::findOrFail($id);

        $data = ['status' => $request->status];
        if ($request->status === 'Returned') {
            $data['returned_date'] = now();
        }

        $assignment->update($data);

        return back()->with('success', 'স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        AssetAssignment::findOrFail($id)->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
