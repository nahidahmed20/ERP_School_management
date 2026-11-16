<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Models\JobPost;
use App\Services\MalwareScanner;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ApplicantController extends Controller
{
    public function index(Request $request)
    {
        $query = Applicant::with('jobPost');

        if ($search = $request->search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('job_post_id')) {
            $query->where('job_post_id', $request->job_post_id);
        }

        $applicants = $query->latest('applied_date')->paginate(\App\Support\PerPage::resolve())->withQueryString();
        $jobPosts = JobPost::select('id', 'title')->latest()->get(); 

        return Inertia::render('Admin/RecruitmentApplicants/Index', [
            'applicants' => $applicants,
            'jobPosts' => $jobPosts,
            'filters' => $request->only(['search', 'status', 'job_post_id', 'per_page'])
        ]);
    }

    public function store(Request $request, MalwareScanner $scanner)
    {
        $request->validate([
            'job_post_id' => ['required', CampusRule::exists('job_posts')],
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'applied_date' => 'required|date',
            'status' => 'required|in:Pending,Shortlisted,Interviewed,Hired,Rejected',
            'resume' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $data = $request->except('resume');

        if ($request->hasFile('resume')) {
            $scanner->assertClean($request->file('resume'));
            $data['resume'] = $request->file('resume')->store('recruitment/resumes/'.config('app.active_campus_id'), 'local');
        }

        Applicant::create($data);

        return back()->with('success', 'আবেদনকারীর তথ্য সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id, MalwareScanner $scanner)
    {
        $applicant = Applicant::findOrFail($id);
        
        $request->validate([
            'job_post_id' => ['required', CampusRule::exists('job_posts')],
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'applied_date' => 'required|date',
            'status' => 'required|in:Pending,Shortlisted,Interviewed,Hired,Rejected',
            'resume' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        $data = $request->except('resume');

        if ($request->hasFile('resume')) {
            $scanner->assertClean($request->file('resume'));
            if ($applicant->resume && Storage::disk('local')->exists($applicant->resume)) {
                Storage::disk('local')->delete($applicant->resume);
            }
            $data['resume'] = $request->file('resume')->store('recruitment/resumes/'.config('app.active_campus_id'), 'local');
        }

        $applicant->update($data);

        return back()->with('success', 'তথ্য সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $applicant = Applicant::findOrFail($id);
        
        if ($applicant->resume && Storage::disk('local')->exists($applicant->resume)) {
            Storage::disk('local')->delete($applicant->resume);
        }
        
        $applicant->delete();
        return back()->with('success', 'আবেদনকারীর রেকর্ড মুছে ফেলা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Shortlisted,Interviewed,Hired,Rejected',
        ]);

        $applicant = Applicant::findOrFail($id);
        $applicant->update(['status' => $request->status]);

        return back()->with('success', 'স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!');
    }
}
