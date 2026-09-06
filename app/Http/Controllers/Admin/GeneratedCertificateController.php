<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeneratedCertificate;
use App\Models\CertificateTemplate;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;

class GeneratedCertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = GeneratedCertificate::with(['template', 'student']);
        if($request->filled('user_id'))$query->where('user_id',$request->user_id);

        if ($search = $request->get('search')) {
            $query->where('certificate_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $certificates = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $certificates->getCollection()->transform(function($certificate){$user=$certificate->student?->loadMissing(['student.currentEnrollment.schoolClass','staff.designation']);$profile=$user?->student?:$user?->staff;$values=['{{name}}'=>$user?->name,'{{id}}'=>$profile?->admission_no?:$profile?->staff_id_no,'{{class}}'=>$user?->student?->currentEnrollment?->schoolClass?->name,'{{designation}}'=>$user?->staff?->designation?->name,'{{school_name}}'=>$certificate->campus?->name?:config('app.name'),'{{purpose}}'=>'official purpose','{{remarks}}'=>''];$certificate->setAttribute('rendered_content',strtr($certificate->template?->content_body??'',$values));return$certificate;});
        $templates = CertificateTemplate::where('is_active', true)->select('id', 'title')->get();
        $campuses = Campus::select('id', 'name')->get();

        // Spatie & Student/Staff Mapping
        $users = User::with(['roles', 'student','staff'])->get()->map(function ($user) {
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
            'certificate_template_id' => ['required',CampusRule::exists('certificate_templates')],
            'user_id' => ['required',CampusRule::exists('users')],
            'issue_date' => 'required|date',
        ]);

        $validated['campus_id']=config('app.active_campus_id');$validated['certificate_no'] = 'CERT-' . strtoupper(uniqid());
        GeneratedCertificate::create($validated);

        return back()->with('success', 'Certificate generated successfully.');
    }

    public function destroy($id)
    {
        GeneratedCertificate::findOrFail($id)->delete();
        return back()->with('success', 'Generated certificate deleted.');
    }
}
