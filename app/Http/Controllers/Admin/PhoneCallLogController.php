<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PhoneCallLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PhoneCallLogController extends Controller
{
    public function index(Request $request)
    {
        $query = PhoneCallLog::query();

        if ($search = $request->search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        if ($request->filled('call_type')) {
            $query->where('call_type', $request->call_type);
        }

        $callLogs = $query->latest('date')->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/FrontOfficeCallLogs/Index', [
            'callLogs' => $callLogs,
            'filters' => $request->only(['search', 'call_type', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'date' => 'required|date',
            'call_type' => 'required|in:Incoming,Outgoing',
        ]);

        PhoneCallLog::create($request->all());

        return back()->with('success', 'ফোন কল লগ সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $callLog = PhoneCallLog::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'date' => 'required|date',
            'call_type' => 'required|in:Incoming,Outgoing',
        ]);

        $callLog->update($request->all());

        return back()->with('success', 'কল লগ সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        PhoneCallLog::findOrFail($id)->delete();
        return back()->with('success', 'কল লগ মুছে ফেলা হয়েছে!');
    }
}