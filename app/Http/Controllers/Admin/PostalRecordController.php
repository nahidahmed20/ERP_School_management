<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PostalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostalRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = PostalRecord::query();

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('reference_no', 'like', "%{$search}%");
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $records = $query->latest('date')->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/FrontOfficePostal/Index', [
            'records' => $records,
            'filters' => $request->only(['search', 'type', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Receive,Dispatch',
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except('attachment');

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('postal_files', 'public');
        }

        PostalRecord::create($data);

        return back()->with('success', 'পোস্টাল রেকর্ড সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $record = PostalRecord::findOrFail($id);
        
        $request->validate([
            'type' => 'required|in:Receive,Dispatch',
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except('attachment');

        if ($request->hasFile('attachment')) {
            if ($record->attachment && Storage::disk('public')->exists($record->attachment)) {
                Storage::disk('public')->delete($record->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('postal_files', 'public');
        }

        $record->update($data);

        return back()->with('success', 'রেকর্ড সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $record = PostalRecord::findOrFail($id);
        
        if ($record->attachment && Storage::disk('public')->exists($record->attachment)) {
            Storage::disk('public')->delete($record->attachment);
        }
        
        $record->delete();
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}