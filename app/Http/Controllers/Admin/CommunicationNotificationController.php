<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationNotification, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CommunicationNotificationController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        // 🟢 FIX: Campus Security Added
        $query = CommunicationNotification::where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // --- Records Per Page Logic ---
        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $notifications = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $notifications = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/Notifications/Index', [
            'notifications' => $notifications,
            'campuses' => Campus::whereKey($activeCampusId)->select('id', 'name')->get(),
            'activeCampusId' => $activeCampusId,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->merge(['campus_id' => config('app.active_campus_id')]);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'notification_type' => 'required|in:App Push,System,Email,SMS',
            'target_audience' => 'required|in:All,Students,Teachers,Parents',
            'status' => 'required|in:Sent,Draft',
        ]);

        CommunicationNotification::create($validated);

        return back()->with('success', 'Notification saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $activeCampusId = config('app.active_campus_id');
        $notification = CommunicationNotification::where('campus_id', $activeCampusId)->findOrFail($id);

        $request->merge(['campus_id' => $activeCampusId]);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'notification_type' => 'required|in:App Push,System,Email,SMS',
            'target_audience' => 'required|in:All,Students,Teachers,Parents',
            'status' => 'required|in:Sent,Draft',
        ]);

        $notification->update($validated);

        return back()->with('success', 'Notification updated successfully.');
    }

    public function destroy($id)
    {
        // 🟢 FIX: Secure Delete
        $notification = CommunicationNotification::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $notification->delete();

        return back()->with('success', 'Notification deleted successfully.');
    }
}
