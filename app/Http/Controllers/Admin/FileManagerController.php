<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FileManagerFile;
use App\Models\FileManagerFolder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FileManagerController extends Controller
{
    public function index(Request $request)
    {
        $query = FileManagerFile::with('folder:id,name', 'uploader:id,name');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->get('folder_id'));
        }

        if ($type = $request->get('type')) {
            $query->where('mime_type', 'like', "{$type}%");
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $files = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Files/Index', [
            'files' => $perPage === 'all'
                ? ['data' => $files, 'links' => [], 'meta' => ['total' => $files->count()]]
                : $files,
            'folders' => FileManagerFolder::select('id', 'name', 'parent_id')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'folder_id', 'type', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB
            'folder_id' => 'nullable|exists:file_manager_folders,id',
        ]);

        $uploaded = $request->file('file');
        $stored = $uploaded->store('file-manager', 'public');

        FileManagerFile::create([
            'folder_id' => $request->get('folder_id'),
            'name' => Str::random(10) . '_' . $uploaded->getClientOriginalName(),
            'original_name' => $uploaded->getClientOriginalName(),
            'path' => $stored,
            'disk' => 'public',
            'mime_type' => $uploaded->getClientMimeType(),
            'size' => $uploaded->getSize(),
            'uploaded_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'ফাইল সফলভাবে আপলোড করা হয়েছে।');
    }

    public function storeFolder(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:file_manager_folders,id',
        ]);
        $data['created_by'] = $request->user()?->id;

        FileManagerFolder::create($data);

        return back()->with('success', 'নতুন Folder তৈরি করা হয়েছে।');
    }

    public function destroy(FileManagerFile $file)
    {
        \Storage::disk($file->disk)->delete($file->path);
        $file->delete();

        return back()->with('success', 'ফাইল মুছে ফেলা হয়েছে।');
    }
}
