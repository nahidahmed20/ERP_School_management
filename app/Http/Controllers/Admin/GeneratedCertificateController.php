<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeneratedCertificate;
use App\Models\CertificateTemplate;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneratedCertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = GeneratedCertificate::with(['template', 'student']);

        if ($search = $request->get('search')) {
            $query->where('certificate_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $certificates = $query->latest()->paginate(10)->withQueryString();
        $templates = CertificateTemplate::where('is_active', true)->select('id', 'title')->get();
        $campuses = Campus::select('id', 'name')->get();

        // Spatie & Student/Staff Mapping
        $users = User::with(['roles', 'student'])->get()->map(function ($user) {
            $displayName = $user->name;
            if ($user->student) {
                $displayName = trim($user->student->first_name . ' ' . $user->student->last_name) . ' (' . $user->student->admission_no . ')';
            }
            return ['id' => $user->id, 'name' => $displayName];
        });

        return Inertia::render('Admin/Documents/GeneratedCertificates/Index', [
            'certificates' => $certificates,
            'templates' => $templates,
            'users' => $users,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'certificate_template_id' => 'required|exists:certificate_templates,id',
            'user_id' => 'required|exists:users,id',
            'issue_date' => 'required|date',
        ]);

        $validated['certificate_no'] = 'CERT-' . strtoupper(uniqid());
        GeneratedCertificate::create($validated);

        return back()->with('success', 'Certificate generated successfully.');
    }

    public function destroy($id)
    {
        GeneratedCertificate::findOrFail($id)->delete();
        return back()->with('success', 'Generated certificate deleted.');
    }
}