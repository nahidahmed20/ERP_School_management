<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{WorkflowApproval, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalWorkflowController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkflowApproval::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('requester_name', 'like', "%{$search}%");
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $approvals = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $approvals = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/System/Workflow/Approvals/Index', [
            'approvals' => $approvals,
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'requester_name' => 'required|string|max:255',
            'details' => 'required|string',
        ]);

        $validated['status'] = 'Pending';
        $validated['approval_chain'] = [];

        WorkflowApproval::create($validated);
        return back()->with('success', 'Approval request submitted.');
    }

    public function update(Request $request, $id)
    {
        $approval = WorkflowApproval::findOrFail($id);

        $request->validate([
            'status' => 'required|string',
            'comment' => 'nullable|string'
        ]);

        $chain = $approval->approval_chain ?? [];

        // Add new step in the chain if a comment or status change is provided
        if ($request->comment || $approval->status !== $request->status) {
            $chain[] = [
                'user' => auth()->user()->name ?? 'Admin',
                'action' => 'Changed status to ' . $request->status,
                'comment' => $request->comment,
                'date' => now()->format('Y-m-d H:i:s')
            ];
        }

        $approval->update([
            'status' => $request->status,
            'approval_chain' => $chain
        ]);

        return back()->with('success', 'Workflow updated successfully.');
    }

    public function destroy($id)
    {
        WorkflowApproval::findOrFail($id)->delete();
        return back()->with('success', 'Approval request deleted.');
    }
}
