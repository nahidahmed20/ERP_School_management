<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{IdCardTemplate, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class IdCardTemplateController extends Controller
{
    private function getSchoolName()
    {
        return DB::table('settings')
            ->where('key', 'school_name')
            ->where(function($q) {
                $q->where('campus_id', config('app.active_campus_id'))
                  ->orWhereNull('campus_id');
            })
            ->orderBy('campus_id', 'desc')
            ->value('value') ?? 'Your School Name';
    }

    public function index(Request $request)
    {
        $query = IdCardTemplate::where('campus_id', config('app.active_campus_id'));
        
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
            'campuses' => Campus::whereKey(config('app.active_campus_id'))->select('id', 'name')->get(),
            'activeCampusId' => config('app.active_campus_id'),
            'schoolName' => $this->getSchoolName(),
        ]);
    }

    public function store(Request $request)
    {
        $request->merge(['campus_id' => config('app.active_campus_id')]);

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'audience'=>'required|in:student,staff,both',
            'layout_type' => 'required|string',
            'design_template'=>'required|string|max:100',
            'text_align'=>'required|in:left,center,right',
            'photo_align'=>'required|in:left,center,right',
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

        if ($request->hasFile('logo_image')) $data['logo_image'] = $request->file('logo_image')->store('templates/idcards', 'public');
        if ($request->hasFile('signature_image')) $data['signature_image'] = $request->file('signature_image')->store('templates/idcards', 'public');
        if ($request->hasFile('background_image')) $data['background_image'] = $request->file('background_image')->store('templates/idcards', 'public');

        IdCardTemplate::create($data);
        return redirect()->route('admin.documents.idcards.index')->with('success', 'ID Card Template created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Documents/IdCards/Form', [
            'item' => IdCardTemplate::where('campus_id', config('app.active_campus_id'))->findOrFail($id),
            'campuses' => Campus::whereKey(config('app.active_campus_id'))->select('id', 'name')->get(),
            'activeCampusId' => config('app.active_campus_id'),
            'schoolName' => $this->getSchoolName(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = IdCardTemplate::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $request->merge(['campus_id' => config('app.active_campus_id')]);

        $data = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'title' => 'required|string|max:255',
            'audience'=>'required|in:student,staff,both',
            'layout_type' => 'required|string',
            'design_template'=>'required|string|max:100',
            'text_align'=>'required|in:left,center,right',
            'photo_align'=>'required|in:left,center,right',
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
            if ($template->logo_image) Storage::disk('public')->delete($template->logo_image);
            $data['logo_image'] = $request->file('logo_image')->store('templates/idcards', 'public');
        } else { unset($data['logo_image']); }

        if ($request->hasFile('signature_image')) {
            if ($template->signature_image) Storage::disk('public')->delete($template->signature_image);
            $data['signature_image'] = $request->file('signature_image')->store('templates/idcards', 'public');
        } else { unset($data['signature_image']); }

        if ($request->hasFile('background_image')) {
            if ($template->background_image) Storage::disk('public')->delete($template->background_image);
            $data['background_image'] = $request->file('background_image')->store('templates/idcards', 'public');
        } else { unset($data['background_image']); }

        $template->update($data);
        return redirect()->route('admin.documents.idcards.index')->with('success', 'ID Card Template updated successfully.');
    }

    public function destroy($id)
    {
        $template = IdCardTemplate::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        
        if ($template->logo_image) Storage::disk('public')->delete($template->logo_image);
        if ($template->signature_image) Storage::disk('public')->delete($template->signature_image);
        if ($template->background_image) Storage::disk('public')->delete($template->background_image);
        
        $template->delete();
        return back()->with('success', 'Template deleted successfully.');
    }
}