<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CommunicationCms, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CommunicationCmsController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunicationCms::query();

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('content_type', 'like', "%{$search}%");
        }

        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $contents = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $contents = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/CMS/Index', [
            'contents' => $contents,
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:communication_cms,slug',
            'content_type' => 'required|string',
            'content_body' => 'nullable|string',
            'is_published' => 'boolean',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Auto-generate slug if empty
        $validated['slug'] = $validated['slug'] ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        // Handle Image Upload
        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('cms_images', 'public');
        }

        CommunicationCms::create($validated);
        return back()->with('success', 'Content published successfully.');
    }

    public function update(Request $request, $id)
    {
        $cms = CommunicationCms::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:communication_cms,slug,'.$id,
            'content_type' => 'required|string',
            'content_body' => 'nullable|string',
            'is_published' => 'boolean',
            'featured_image' => 'nullable', // string or file
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        if ($request->hasFile('featured_image')) {
            if ($cms->featured_image) Storage::disk('public')->delete($cms->featured_image);
            $validated['featured_image'] = $request->file('featured_image')->store('cms_images', 'public');
        } else {
            unset($validated['featured_image']);
        }

        $cms->update($validated);
        return back()->with('success', 'Content updated successfully.');
    }

    public function destroy($id)
    {
        $cms = CommunicationCms::findOrFail($id);
        if ($cms->featured_image) Storage::disk('public')->delete($cms->featured_image);
        $cms->delete();
        return back()->with('success', 'Content deleted successfully.');
    }
}
