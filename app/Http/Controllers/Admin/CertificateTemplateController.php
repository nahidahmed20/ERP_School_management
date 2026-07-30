<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CertificateTemplate, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CertificateTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = CertificateTemplate::query();
        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        return Inertia::render('Admin/Documents/CertificateTemplates/Index', [
            'templates' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Documents/CertificateTemplates/Form', [
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'template_type' => 'required|string',
            'content_body' => 'required|string',
            'signature_1_title' => 'nullable|string|max:255',
            'signature_2_title' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg|max:3072', // Up to 3MB
            'signature_1_image' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'signature_2_image' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
        ]);

        if ($request->hasFile('background_image')) $data['background_image'] = $request->file('background_image')->store('templates/certificates', 'public');
        if ($request->hasFile('signature_1_image')) $data['signature_1_image'] = $request->file('signature_1_image')->store('templates/certificates', 'public');
        if ($request->hasFile('signature_2_image')) $data['signature_2_image'] = $request->file('signature_2_image')->store('templates/certificates', 'public');

        CertificateTemplate::create($data);
        return redirect()->route('admin.documents.certificatetemplates.index')->with('success', 'Template created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Documents/CertificateTemplates/Form', [
            'item' => CertificateTemplate::findOrFail($id),
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = CertificateTemplate::findOrFail($id);

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'template_type' => 'required|string',
            'content_body' => 'required|string',
            'signature_1_title' => 'nullable|string|max:255',
            'signature_2_title' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'background_image' => 'nullable',
            'signature_1_image' => 'nullable',
            'signature_2_image' => 'nullable',
        ]);

        if ($request->hasFile('background_image')) {
            if ($template->background_image) Storage::disk('public')->delete($template->background_image);
            $data['background_image'] = $request->file('background_image')->store('templates/certificates', 'public');
        } else { unset($data['background_image']); }

        if ($request->hasFile('signature_1_image')) {
            if ($template->signature_1_image) Storage::disk('public')->delete($template->signature_1_image);
            $data['signature_1_image'] = $request->file('signature_1_image')->store('templates/certificates', 'public');
        } else { unset($data['signature_1_image']); }

        if ($request->hasFile('signature_2_image')) {
            if ($template->signature_2_image) Storage::disk('public')->delete($template->signature_2_image);
            $data['signature_2_image'] = $request->file('signature_2_image')->store('templates/certificates', 'public');
        } else { unset($data['signature_2_image']); }

        $template->update($data);
        return redirect()->route('admin.documents.certificatetemplates.index')->with('success', 'Template updated.');
    }

    public function destroy($id)
    {
        $template = CertificateTemplate::findOrFail($id);
        if ($template->background_image) Storage::disk('public')->delete($template->background_image);
        if ($template->signature_1_image) Storage::disk('public')->delete($template->signature_1_image);
        if ($template->signature_2_image) Storage::disk('public')->delete($template->signature_2_image);
        $template->delete();
        return back()->with('success', 'Template deleted.');
    }
}
