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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GeneratedCertificateController extends Controller
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
        $query = GeneratedCertificate::with(['template', 'student', 'campus']);
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($search = $request->get('search')) {
            $query->where('certificate_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $certificates = $query->latest()->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $schoolName = $this->getSchoolName(); 
        
        $certificates->getCollection()->transform(function($certificate) use ($schoolName) {
            $user = $certificate->student?->loadMissing(['student.currentEnrollment.schoolClass', 'staff.designation']);
            $profile = $user?->student ?: $user?->staff;
            
            $values = [
                '{{name}}' => $user?->name,
                '{{id}}' => $profile?->admission_no ?: $profile?->staff_id_no,
                '{{class}}' => $user?->student?->currentEnrollment?->schoolClass?->name,
                '{{designation}}' => $user?->staff?->designation?->name,
                '{{school_name}}' => $schoolName, 
                '{{purpose}}' => 'official purpose',
                '{{remarks}}' => ''
            ];
            
            $certificate->setAttribute('rendered_content', strtr($certificate->template?->content_body ?? '', $values));
            return $certificate;
        });

        // 🟢 FIX: Select কলামের লিস্ট অটোমেট করা হয়েছে যেন মিসিং কলামের কারণে এরর না দেয়
        $columns = ['id', 'title', 'template_type', 'content_body', 'background_image', 'signature_1_image', 'signature_2_image', 'signature_1_title', 'signature_2_title'];
        
        // যদি ডাটাবেসে design_style কলামটি থেকে থাকে, তবেই সেটিকে ফেচ করবে
        if (Schema::hasColumn('certificate_templates', 'design_style')) {
            $columns[] = 'design_style';
        }

        $templates = CertificateTemplate::where('is_active', true)
            ->select($columns)
            ->get();
            
        $campuses = Campus::whereKey(config('app.active_campus_id'))->select('id', 'name')->get();

        $users = User::with(['roles', 'student', 'staff'])->get()->map(function ($user) {
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
            'activeCampusId' => config('app.active_campus_id'),
            'schoolName' => $schoolName,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    { 
        $request->merge(['campus_id' => config('app.active_campus_id')]);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'certificate_template_id' => ['required', CampusRule::exists('certificate_templates')],
            'user_id' => ['required', CampusRule::exists('users')],
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