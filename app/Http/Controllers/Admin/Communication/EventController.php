<?php

namespace App\Http\Controllers\Admin\Communication;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with('classroom')->orderBy('start_datetime', 'asc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->get('filter') === 'upcoming') {
            $query->where('start_datetime', '>=', now());
        }

        return Inertia::render('Admin/Communication/Events/Index', [
    'events' => $query->paginate(15)->withQueryString(),
    'classrooms' => Classroom::select('id', 'room_number', 'type')->where('is_active', true)->get(),
    'filters' => [
        'type' => $request->input('type', ''),
        'filter' => $request->input('filter', 'upcoming'),
    ],
]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        
        if ($this->checkRoomClash($request)) {
            return back()->with('error', 'এই সময়ে নির্বাচিত রুমটি অন্য কোনো ক্লাস বা ইভেন্টের জন্য বুক করা আছে!');
        }

        Event::create($data);
        return back()->with('success', 'ইভেন্ট সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $data = $this->validateData($request);

        if ($this->checkRoomClash($request, $id)) {
            return back()->with('error', 'এই সময়ে নির্বাচিত রুমটি অন্য কোনো ক্লাস বা ইভেন্টের জন্য বুক করা আছে!');
        }

        $event->update($data);
        return back()->with('success', 'ইভেন্ট আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();
        return back()->with('success', 'ইভেন্ট মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:Event,Meeting,Holiday,Other',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }

    private function checkRoomClash(Request $request, $ignoreId = null)
    {
        if (empty($request->classroom_id)) return false;

        $query = Event::where('classroom_id', $request->classroom_id)
            ->where(function($q) use ($request) {
                $q->where('start_datetime', '<', $request->end_datetime)
                  ->where('end_datetime', '>', $request->start_datetime);
            });
            
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}