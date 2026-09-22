<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{IdCardTemplate, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class IdCardTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = IdCardTemplate::query();
        if (config('app.active_campus_id')) {
            $query->where('campus_id', config('app.active_campus_id'));
        }
        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        return Inertia::render('Admin/Documents/IdCards/Index', [
            'templates' => $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Documents/IdCards/Form', [
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => config('app.active_campus_id') ?? Campus::first()->id ?? null,
        ]);
    }

    public function store(Request $request)
    {
        // 🟢 FIX 3: Ultimate Fallback for Backend
        if (empty($request->campus_id)) {
            $fallback = config('app.active_campus_id') ?? Campus::first()->id ?? null;
            $request->merge(['campus_id' => $fallback]);
        }

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'audience'=>'required|in:student,staff,both',
            'layout_type' => 'required|string',
            'design_template'=>'required|string|max:100',
            'text_align'=>'required|in:left,center,right',
            'photo_align'=>'required|in:left,center,right',
            'field_labels'=>'nullable|array',
            'field_labels.*'=>'nullable|string|max:50',
            'theme_color' => 'required|string',
            'show_blood_group' => 'boolean',
            'show_address' => 'boolean',
            'show_phone' => 'boolean',
            'back_side_content' => 'nullable|string',
            'is_active' => 'boolean',
            'logo_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'signature_image' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('logo_image')) {
            $data['logo_image'] = $request->file('logo_image')->store('templates/idcards', 'public');
        }
        if ($request->hasFile('signature_image')) {
            $data['signature_image'] = $request->file('signature_image')->store('templates/idcards', 'public');
        }
        if ($request->hasFile('background_image')) {
            $data['background_image'] = $request->file('background_image')->store('templates/idcards', 'public');
        }

        IdCardTemplate::create($data);
        return redirect()->route('admin.documents.idcards.index')->with('success', 'Template created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Documents/IdCards/Form', [
            'item' => IdCardTemplate::findOrFail($id),
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => config('app.active_campus_id') ?? Campus::first()->id ?? null,
        ]);
    }

    public function update(Request $request, $id)
    {
        // 🟢 FIX 3: Ultimate Fallback for Backend
        if (empty($request->campus_id)) {
            $fallback = config('app.active_campus_id') ?? Campus::first()->id ?? null;
            $request->merge(['campus_id' => $fallback]);
        }

        $template = IdCardTemplate::findOrFail($id);

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'audience'=>'required|in:student,staff,both',
            'layout_type' => 'required|string',
            'design_template'=>'required|string|max:100',
            'text_align'=>'required|in:left,center,right',
            'photo_align'=>'required|in:left,center,right',
            'field_labels'=>'nullable|array',
            'field_labels.*'=>'nullable|string|max:50',
            'theme_color' => 'required|string',
            'show_blood_group' => 'boolean',
            'show_address' => 'boolean',
            'show_phone' => 'boolean',
            'back_side_content' => 'nullable|string',
            'is_active' => 'boolean',
            'logo_image' => 'nullable', 
            'signature_image' => 'nullable',
            'background_image' => 'nullable',
        ]);

        if ($request->hasFile('logo_image')) {
            if ($template->logo_image) Storage::disk('public')->delete($template->logo_image);
            $data['logo_image'] = $request->file('logo_image')->store('templates/idcards', 'public');
        } else {
            unset($data['logo_image']); 
        }

        if ($request->hasFile('signature_image')) {
            if ($template->signature_image) Storage::disk('public')->delete($template->signature_image);
            $data['signature_image'] = $request->file('signature_image')->store('templates/idcards', 'public');
        } else {
            unset($data['signature_image']);
        }

        if ($request->hasFile('background_image')) {
            if ($template->background_image) Storage::disk('public')->delete($template->background_image);
            $data['background_image'] = $request->file('background_image')->store('templates/idcards', 'public');
        } else {
            unset($data['background_image']);
        }

        $template->update($data);
        return redirect()->route('admin.documents.idcards.index')->with('success', 'Template updated successfully.');
    }

    public function destroy($id)
    {
        $template = IdCardTemplate::findOrFail($id);
        if ($template->logo_image) Storage::disk('public')->delete($template->logo_image);
        if ($template->signature_image) Storage::disk('public')->delete($template->signature_image);
        if ($template->background_image) Storage::disk('public')->delete($template->background_image);
        $template->delete();
        return back()->with('success', 'Template deleted successfully.');
    }
}