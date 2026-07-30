<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{TranscriptTemplate, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TranscriptTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = TranscriptTemplate::query();
        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        return Inertia::render('Admin/Documents/Transcripts/Index', [
            'templates' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Documents/Transcripts/Form', [
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'grading_system' => 'required|string|max:100',
            'header_text' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'authorized_signature_title' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'watermark_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'authorized_signature_image' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
        ]);

        if ($request->hasFile('watermark_image')) $data['watermark_image'] = $request->file('watermark_image')->store('templates/transcripts', 'public');
        if ($request->hasFile('authorized_signature_image')) $data['authorized_signature_image'] = $request->file('authorized_signature_image')->store('templates/transcripts', 'public');

        TranscriptTemplate::create($data);
        return redirect()->route('admin.documents.transcripts.index')->with('success', 'Transcript Template created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Documents/Transcripts/Form', [
            'item' => TranscriptTemplate::findOrFail($id),
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = TranscriptTemplate::findOrFail($id);

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'grading_system' => 'required|string|max:100',
            'header_text' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'authorized_signature_title' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'watermark_image' => 'nullable',
            'authorized_signature_image' => 'nullable',
        ]);

        if ($request->hasFile('watermark_image')) {
            if ($template->watermark_image) Storage::disk('public')->delete($template->watermark_image);
            $data['watermark_image'] = $request->file('watermark_image')->store('templates/transcripts', 'public');
        } else { unset($data['watermark_image']); }

        if ($request->hasFile('authorized_signature_image')) {
            if ($template->authorized_signature_image) Storage::disk('public')->delete($template->authorized_signature_image);
            $data['authorized_signature_image'] = $request->file('authorized_signature_image')->store('templates/transcripts', 'public');
        } else { unset($data['authorized_signature_image']); }

        $template->update($data);
        return redirect()->route('admin.documents.transcripts.index')->with('success', 'Transcript Template updated.');
    }

    public function destroy($id)
    {
        $template = TranscriptTemplate::findOrFail($id);
        if ($template->watermark_image) Storage::disk('public')->delete($template->watermark_image);
        if ($template->authorized_signature_image) Storage::disk('public')->delete($template->authorized_signature_image);
        $template->delete();
        return back()->with('success', 'Transcript Template deleted.');
    }
}
