<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{StudyMaterial, SchoolClass, Subject};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class StudyMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = StudyMaterial::with(['schoolClass', 'subject', 'uploader:id,name']);

        if ($classId = $request->get('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $materials = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Academics/StudyMaterials/Index', [
            'materials' => $materials,
            'classes' => SchoolClass::where('is_active', true)->get(),
            'subjects' => Subject::where('is_active', true)->get(),
            'filters' => [
                'class_id' => $request->get('class_id', ''),
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store('study_materials', 'public');

        StudyMaterial::create([
            'title' => $request->title,
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id,
            'description' => $request->description,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'uploaded_by' => auth()->id(), // Assuming logged-in user is uploading
        ]);

        return back()->with('success', 'Study material uploaded successfully.');
    }

    public function download($id)
    {
        $material = StudyMaterial::findOrFail($id);
        return Storage::disk('public')->download($material->file_path, $material->title . '.' . $material->file_type);
    }

    public function destroy($id)
    {
        $material = StudyMaterial::findOrFail($id);

        // Delete file from storage
        if (Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();
        return back()->with('success', 'Study material deleted successfully.');
    }
}
