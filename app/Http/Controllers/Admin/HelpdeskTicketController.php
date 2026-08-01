<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{HelpdeskTicket, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class HelpdeskTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = HelpdeskTicket::query();

        if ($search = $request->get('search')) {
            $query->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $tickets = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $tickets = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/Helpdesk/Index', [
            'tickets' => $tickets,
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
            'requester_name' => 'required|string|max:255',
            'requester_type' => 'required|string',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|string',
        ]);

        $validated['ticket_number'] = 'TKT-' . strtoupper(Str::random(6));
        $validated['status'] = 'Open';
        $validated['replies'] = [];

        HelpdeskTicket::create($validated);
        return back()->with('success', 'Ticket created successfully.');
    }

    public function update(Request $request, $id)
    {
        $ticket = HelpdeskTicket::findOrFail($id);

        $validated = $request->validate([
            'priority' => 'required|string',
            'status' => 'required|string',
        ]);

        $ticket->update($validated);
        return back()->with('success', 'Ticket status updated.');
    }

    public function reply(Request $request, $id)
    {
        $ticket = HelpdeskTicket::findOrFail($id);

        $request->validate(['message' => 'required|string']);

        $replies = $ticket->replies ?? [];
        $replies[] = [
            'sender' => auth()->user()->name ?? 'Admin',
            'message' => $request->message,
            'date' => now()->format('Y-m-d H:i:s')
        ];

        // If admin replies, status automatically changes to In Progress (if it was Open)
        $status = $ticket->status === 'Open' ? 'In Progress' : $ticket->status;

        $ticket->update([
            'replies' => $replies,
            'status' => $status
        ]);

        return back()->with('success', 'Reply added successfully.');
    }

    public function destroy($id)
    {
        HelpdeskTicket::findOrFail($id)->delete();
        return back()->with('success', 'Ticket deleted.');
    }
}
