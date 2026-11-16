<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{StudyMaterial, SchoolClass, Subject};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Services\MalwareScanner;
use Illuminate\Validation\ValidationException;

class StudyMaterialController extends Controller
{
    
    private function existsRule(string $table)
    {
        $campusId = config('app.active_campus_id');
        $rule = Rule::exists($table, 'id');
        return $campusId ? $rule->where('campus_id', $campusId) : $rule;
    }

    public function index(Request $request)
    {
        $campusId = config('app.active_campus_id');

        // 🔒 Data Leak Protection Logic
        $filter = fn($q) => $campusId ? $q->where('campus_id', $campusId) : $q;

        $query = StudyMaterial::with(['schoolClass', 'subject', 'uploader:id,name'])->where($filter);

        if ($classId = $request->get('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $materials = $query->latest()->paginate(\App\Support\PerPage::resolve(15))->withQueryString();

        return Inertia::render('Admin/Academics/StudyMaterials/Index', [
            'materials' => $materials,
            'classes' => SchoolClass::where('is_active', true)->where($filter)->get(),
            'subjects' => Subject::where('is_active', true)->where($filter)->get(),
            'filters' => [
                'class_id' => $request->get('class_id', ''),
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function store(Request $request, MalwareScanner $scanner)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'class_id' => ['required', $this->existsRule('school_classes')],
            'subject_id' => ['nullable', $this->existsRule('subjects')],
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png|max:10240',
        ]);

        $class = SchoolClass::findOrFail($request->class_id);
        $campusId = $class->campus_id; 

        if ($request->filled('subject_id') && ! $class->subjects()->whereKey($request->subject_id)->exists()) {
            throw ValidationException::withMessages(['subject_id' => 'Select a subject assigned to this class.']);
        }

        $file = $request->file('file');
        $scanner->assertClean($file);
        
        $path = $file->store('study_materials/' . $campusId, 'local');

        StudyMaterial::create([
            'campus_id' => $campusId, 
            'title' => $request->title,
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id,
            'description' => $request->description,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'uploaded_by' => auth()->id(),
        ]);

        return back()->with('success', 'Study material uploaded successfully.');
    }

    public function download($id)
    {
        $material = StudyMaterial::findOrFail($id);
        $disk = Storage::disk($material->storageDisk());
        abort_unless($disk->exists($material->file_path), 404);
        return $disk->download($material->file_path, basename($material->title) . '.' . $material->file_type);
    }

    public function destroy($id)
    {
        $material = StudyMaterial::findOrFail($id);

        if (Storage::disk($material->storageDisk())->exists($material->file_path)) {
            Storage::disk($material->storageDisk())->delete($material->file_path);
        }

        $material->delete();
        return back()->with('success', 'Study material deleted successfully.');
    }
}