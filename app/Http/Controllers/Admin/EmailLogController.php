<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{EmailLog, EmailTemplate};
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->get('tab', 'logs'); // 'logs' or 'templates'

        $logs = EmailLog::latest()->paginate(15)->withQueryString();
        $templates = EmailTemplate::latest()->get();

        return Inertia::render('Admin/Communication/EmailLogs/Index', [
            'logs' => $logs,
            'templates' => $templates,
            'activeTab' => $activeTab,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function destroyLog($id)
    {
        EmailLog::findOrFail($id)->delete();
        return back()->with('success', 'Email log deleted.');
    }

    // --- Template Methods ---

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        EmailTemplate::create($validated);
        return back()->with('success', 'Email Template created successfully.');
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);
        return back()->with('success', 'Email Template updated.');
    }

    public function destroyTemplate($id)
    {
        EmailTemplate::findOrFail($id)->delete();
        return back()->with('success', 'Template deleted successfully.');
    }
}