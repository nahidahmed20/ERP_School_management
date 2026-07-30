<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificateTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = CertificateTemplate::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('template_type', 'like', "%{$search}%");
        }

        $templates = $query->latest()->paginate(10)->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/Documents/CertificateTemplates/Index', [
            'templates' => $templates,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'template_type' => 'required|string',
            'content_body' => 'required|string',
            'is_active' => 'boolean',
        ]);

        CertificateTemplate::create($validated);

        return back()->with('success', 'Certificate template created successfully.');
    }

    public function update(Request $request, $id)
    {
        $template = CertificateTemplate::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'template_type' => 'required|string',
            'content_body' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return back()->with('success', 'Certificate template updated successfully.');
    }

    public function destroy($id)
    {
        CertificateTemplate::findOrFail($id)->delete();
        return back()->with('success', 'Certificate template deleted.');
    }
}