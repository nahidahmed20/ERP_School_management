<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationNotification, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunicationNotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunicationNotification::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
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
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'notification_type' => 'required|string',
            'target_audience' => 'required|string',
            'status' => 'required|string',
        ]);

        CommunicationNotification::create($validated);
        return back()->with('success', 'Notification saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $notification = CommunicationNotification::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'notification_type' => 'required|string',
            'target_audience' => 'required|string',
            'status' => 'required|string',
        ]);

        $notification->update($validated);
        return back()->with('success', 'Notification updated successfully.');
    }

    public function destroy($id)
    {
        CommunicationNotification::findOrFail($id)->delete();
        return back()->with('success', 'Notification deleted.');
    }
}
