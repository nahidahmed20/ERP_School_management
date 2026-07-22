<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CertificateTemplateController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 12);
        $search = $request->input('search');
        $type = $request->input('type');

        $query = CertificateTemplate::latest();

        // Search Logic
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('body_content', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($type) {
            $query->where('type', $type);
        }

        $templates = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Documents/CertificateTemplates/Index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'type', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $imagePath = null;
            if ($request->hasFile('background_image')) {
                $imagePath = $request->file('background_image')->store('certificates/templates', 'public');
            }

            CertificateTemplate::create(array_merge(
                $request->except('background_image'),
                ['background_image' => $imagePath]
            ));

            DB::commit();
            return back()->with('success', 'Certificate Template created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $template = CertificateTemplate::findOrFail($id);
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $imagePath = $template->background_image;

            if ($request->hasFile('background_image')) {
                if ($template->background_image && Storage::disk('public')->exists($template->background_image)) {
                    Storage::disk('public')->delete($template->background_image);
                }
                $imagePath = $request->file('background_image')->store('certificates/templates', 'public');
            }

            $template->update(array_merge(
                $request->except('background_image'),
                ['background_image' => $imagePath]
            ));

            DB::commit();
            return back()->with('success', 'Template updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $template = CertificateTemplate::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($template->background_image && Storage::disk('public')->exists($template->background_image)) {
                Storage::disk('public')->delete($template->background_image);
            }

            $template->delete();

            DB::commit();
            return back()->with('success', 'Template deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    private function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'body_content' => 'required|string',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}
