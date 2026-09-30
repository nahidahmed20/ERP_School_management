<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{EmailLog, EmailTemplate, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->get('tab', 'logs'); 
        $activeCampusId = config('app.active_campus_id');

        $logQuery = EmailLog::where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $logQuery->where(function($q) use ($search) {
                $q->where('recipient_email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $perPageRaw = $request->get('per_page', '15');
        $logs = $perPageRaw === 'All' 
            ? $logQuery->latest()->paginate(max($logQuery->count(), 1))->withQueryString()
            : $logQuery->latest()->paginate((int) $perPageRaw)->withQueryString();

        $templates = EmailTemplate::where(function($q) use ($activeCampusId) {
            $q->where('campus_id', $activeCampusId)
              ->orWhereNull('campus_id');
        })->latest()->get();

        return Inertia::render('Admin/Communication/EmailLogs/Index', [
            'logs' => $logs,
            'templates' => $templates,
            'activeTab' => $activeTab,
            'campuses' => Campus::select('id', 'name')->where('is_active', true)->get(),
            'activeCampusId' => $activeCampusId,
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function destroyLog($id)
    {
        $log = EmailLog::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $log->delete();
        
        return back()->with('success', 'Email log deleted successfully.');
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['campus_id'] = $request->has('campus_id') ? $request->campus_id : config('app.active_campus_id');

        EmailTemplate::create($validated);
        
        return back()->with('success', 'Email Template created successfully.');
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = EmailTemplate::where(function($q) {
            $q->where('campus_id', config('app.active_campus_id'))
              ->orWhereNull('campus_id');
        })->findOrFail($id);
        
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($request->has('campus_id')) {
            $validated['campus_id'] = $request->campus_id;
        }

        $template->update($validated);
        
        return back()->with('success', 'Email Template updated successfully.');
    }

    public function destroyTemplate($id)
    {
        $template = EmailTemplate::where(function($q) {
            $q->where('campus_id', config('app.active_campus_id'))
              ->orWhereNull('campus_id');
        })->findOrFail($id);

        $template->delete();
        
        return back()->with('success', 'Template deleted successfully.');
    }
}