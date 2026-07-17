<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LeaveType::query()->latest();

        // Search by Name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by Status (Active / Inactive)
        if ($request->filled('status')) {
            $isActive = $request->status === 'active' ? true : false;
            $query->where('is_active', $isActive);
        }

        // Pagination setup
        $perPage = $request->input('per_page', 10);
        $leaveTypes = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/LeaveTypes/Index', [
            'leaveTypes' => $leaveTypes,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:leave_types,name',
            'days_allowed' => 'required|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        LeaveType::create([
            'name' => $request->name,
            'days_allowed' => $request->days_allowed,
            'is_active' => $request->is_active ?? true,
        ]);

        return back()->with('success', 'ছুটির ধরন (Leave Type) সফলভাবে তৈরি করা হয়েছে!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:leave_types,name,' . $leaveType->id,
            'days_allowed' => 'required|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $leaveType->update([
            'name' => $request->name,
            'days_allowed' => $request->days_allowed,
            'is_active' => $request->is_active ?? true,
        ]);

        return back()->with('success', 'ছুটির ধরন সফলভাবে আপডেট করা হয়েছে!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $leaveType->delete();

        return back()->with('success', 'ছুটির ধরন মুছে ফেলা হয়েছে!');
    }
}
