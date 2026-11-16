<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $type = $request->input('type');

        $query = Notice::latest('notice_date');

        // Search Logic
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($type) {
            $query->where('type', $type);
        }

        $notices = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/FrontOffice/Notices/Index', [
            'notices' => $notices,
            'filters' => $request->only(['search', 'type', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('notices', 'public');
            }

            Notice::create(array_merge($request->all(), ['attachment' => $attachmentPath]));

            DB::commit();
            return back()->with('success', 'Notice created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $notice = Notice::findOrFail($id);
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $attachmentPath = $notice->attachment;
            if ($request->hasFile('attachment')) {
                if ($notice->attachment && Storage::disk('public')->exists($notice->attachment)) {
                    Storage::disk('public')->delete($notice->attachment);
                }
                $attachmentPath = $request->file('attachment')->store('notices', 'public');
            }

            $notice->update(array_merge($request->all(), ['attachment' => $attachmentPath]));

            DB::commit();
            return back()->with('success', 'Notice updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $notice = Notice::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($notice->attachment && Storage::disk('public')->exists($notice->attachment)) {
                Storage::disk('public')->delete($notice->attachment);
            }
            $notice->delete();

            DB::commit();
            return back()->with('success', 'Notice deleted!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    private function validationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'notice_date' => 'required|date',
            'description' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            'is_active' => 'nullable|boolean',
        ];
    }
}
