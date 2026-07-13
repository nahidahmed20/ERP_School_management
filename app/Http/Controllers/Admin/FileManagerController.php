<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FileManagerFile;
use App\Models\FileManagerFolder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FileManagerController extends Controller
{
    public function index(Request $request)
    {
        $query = FileManagerFile::with(['folder:id,name', 'uploader:id,name']);

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
            $query->where('mime_type', 'like', "%{$type}%");
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);

        if ($perPage === 'all') {
            $files = $query->get();
            $formatted = $this->formatFiles($files);

            $paginatedFiles = [
                'data' => $formatted,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $files->count(),
                'total' => $files->count(),
                'from' => $files->count() > 0 ? 1 : null,
                'to' => $files->count(),
                'links' => [],
            ];
        } else {
            $files = $query->paginate((int) $perPage)->withQueryString();

            $files->getCollection()->transform(function ($file) {
                return $this->formatFile($file);
            });
            $paginatedFiles = $files;
        }

        return Inertia::render('Admin/Files/Index', [
            'files' => $paginatedFiles,
            'folders' => FileManagerFolder::select('id', 'name', 'parent_id')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'folder_id', 'type', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB Limit
            'folder_id' => 'nullable|exists:file_manager_folders,id',
        ]);

        try {
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

            return redirect()->back()->with('success', 'ফাইল সফলভাবে আপলোড করা হয়েছে।');
        } catch (\Exception $e) {
            Log::error('File Upload Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'ফাইল আপলোড করতে সমস্যা হয়েছে!');
        }
    }


    public function storeFolder(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:file_manager_folders,id',
        ]);

        try {
            $data['created_by'] = $request->user()?->id;
            FileManagerFolder::create($data);

            return back()->with('success', 'নতুন ফোল্ডার তৈরি করা হয়েছে।');
        } catch (\Exception $e) {
            Log::error('Folder Create Error: ' . $e->getMessage());
            return back()->withErrors(['name' => 'ফোল্ডার তৈরি করতে সমস্যা হয়েছে!']);
        }
    }

    public function destroy(FileManagerFile $file)
    {
        try {
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }

            $file->delete();

            return back()->with('success', 'ফাইল মুছে ফেলা হয়েছে।');
        } catch (\Exception $e) {
            Log::error('File Delete Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'ফাইল মুছতে সমস্যা হয়েছে!']);
        }
    }

    // --- Helper Methods ---

    private function formatFiles($files)
    {
        return $files->map(function ($file) {
            return $this->formatFile($file);
        });
    }

    private function formatFile($file)
    {
        return [
            'id' => $file->id,
            'original_name' => $file->original_name,
            'mime_type' => $file->mime_type,
            'size' => $file->size,
            'human_size' => $this->bytesToHuman($file->size),
            'url' => Storage::disk($file->disk)->url($file->path),
            'created_at' => $file->created_at->format('d M, Y h:i A'),
            'folder' => $file->folder,
            'uploader' => $file->uploader,
        ];
    }

    private function bytesToHuman($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
