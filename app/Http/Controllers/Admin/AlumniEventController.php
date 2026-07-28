<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AlumniEventController extends Controller
{
    public function index(Request $request)
    {
        $query = AlumniEvent::query();

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->latest('date')->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/AlumniEvents/Index', [
            'events' => $events,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Upcoming,Completed,Cancelled',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->except('cover_photo');

        if ($request->hasFile('cover_photo')) {
            $data['cover_photo'] = $request->file('cover_photo')->store('event_photos', 'public');
        }

        AlumniEvent::create($data);

        return back()->with('success', 'ইভেন্ট সফলভাবে তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $event = AlumniEvent::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Upcoming,Completed,Cancelled',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->except('cover_photo');

        if ($request->hasFile('cover_photo')) {
            if ($event->cover_photo && Storage::disk('public')->exists($event->cover_photo)) {
                Storage::disk('public')->delete($event->cover_photo);
            }
            $data['cover_photo'] = $request->file('cover_photo')->store('event_photos', 'public');
        }

        $event->update($data);

        return back()->with('success', 'ইভেন্ট আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Upcoming,Completed,Cancelled',
        ]);

        $event = AlumniEvent::findOrFail($id);
        $event->update(['status' => $request->status]);

        return back()->with('success', 'ইভেন্টের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $event = AlumniEvent::findOrFail($id);

        if ($event->cover_photo && Storage::disk('public')->exists($event->cover_photo)) {
            Storage::disk('public')->delete($event->cover_photo);
        }

        $event->delete();
        return back()->with('success', 'ইভেন্ট মুছে ফেলা হয়েছে!');
    }
}
