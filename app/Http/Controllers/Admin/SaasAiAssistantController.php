<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaasAiAssistant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaasAiAssistantController extends Controller
{
    public function index(Request $request)
    {
        $query = SaasAiAssistant::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('provider', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $assistants = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $assistants = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/SaaS/AI/Index', [
            'assistants' => $assistants,
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
            'provider' => 'required|string|max:50',
            'model_name' => 'required|string|max:100',
            'system_prompt' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        SaasAiAssistant::create($validated);
        return back()->with('success', 'New AI Assistant created successfully.');
    }

    public function update(Request $request, $id)
    {
        $assistant = SaasAiAssistant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'provider' => 'required|string|max:50',
            'model_name' => 'required|string|max:100',
            'system_prompt' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $assistant->update($validated);
        return back()->with('success', 'AI Assistant configured successfully.');
    }

    public function destroy($id)
    {
        SaasAiAssistant::findOrFail($id)->delete();
        return back()->with('success', 'AI Assistant removed.');
    }
}
