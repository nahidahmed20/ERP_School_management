<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{SmsLog, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class SmsLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SmsLog::query();

        if ($search = $request->get('search')) {
            $query->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
        }

        // --- Records Per Page Logic ---
        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $logs = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $logs = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/SmsLogs/Index', [
            'logs' => $logs,
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'recipient_name' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        // Here you would integrate your actual SMS Gateway API (e.g., Twilio, BongoSMS, etc.)
        // For now, we just save the log assuming it was sent successfully.

        $validated['status'] = 'Sent';

        SmsLog::create($validated);
        return back()->with('success', 'SMS sent and logged successfully.');
    }

    public function destroy($id)
    {
        SmsLog::findOrFail($id)->delete();
        return back()->with('success', 'SMS Log deleted.');
    }
}
