<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationCalendar, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunicationCalendarController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunicationCalendar::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('event_type', 'like', "%{$search}%");
        }

        // --- Records Per Page Logic ---
        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $events = $query->orderBy('start_date', 'desc')->paginate($totalCount)->withQueryString();
        } else {
            $events = $query->orderBy('start_date', 'desc')->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/Calendars/Index', [
            'events' => $events,
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
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'event_type' => 'required|string',
            'color_theme' => 'required|string',
            'is_active' => 'boolean',
        ]);

        CommunicationCalendar::create($validated);
        return back()->with('success', 'Event added successfully.');
    }

    public function update(Request $request, $id)
    {
        $event = CommunicationCalendar::findOrFail($id);
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'event_type' => 'required|string',
            'color_theme' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $event->update($validated);
        return back()->with('success', 'Event updated successfully.');
    }

    public function destroy($id)
    {
        CommunicationCalendar::findOrFail($id)->delete();
        return back()->with('success', 'Event deleted.');
    }
}
