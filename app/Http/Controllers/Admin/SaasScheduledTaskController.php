<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasScheduledTask;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasScheduledTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasScheduledTask::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('command', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $tasks = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $tasks = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/Tasks/Index', [
            'tasks' => $tasks,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command' => 'required|string|max:255',
            'frequency' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        SaasScheduledTask::create($validated);
        return back()->with('success', 'Scheduled task added successfully.');
    }

    public function update(Request $request, $id)
    {
        $task = SaasScheduledTask::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command' => 'required|string|max:255',
            'frequency' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $task->update($validated);
        return back()->with('success', 'Scheduled task updated successfully.');
    }

    public function destroy($id)
    {
        SaasScheduledTask::findOrFail($id)->delete();
        return back()->with('success', 'Scheduled task removed.');
    }
}
