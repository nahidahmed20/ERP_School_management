<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Interview::with(['applicant.jobPost']);

        if ($search = $request->search) {
            $query->whereHas('applicant', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            })->orWhere('interviewer_name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $interviews = $query->latest('interview_date')->paginate($request->per_page ?? 10)->withQueryString();

        $applicants = Applicant::whereIn('status', ['Pending', 'Shortlisted', 'Interviewed'])
                                ->with('jobPost')
                                ->latest()
                                ->get();

        return Inertia::render('Admin/RecruitmentInterviews/Index', [
            'interviews' => $interviews,
            'applicants' => $applicants,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'interviewer_name' => 'required|string|max:255',
            'interview_date' => 'required|date',
            'interview_time' => 'required',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Scheduled,Completed,Cancelled',
            'remarks' => 'nullable|string',
        ]);

        $interview = Interview::create($request->all());

        if ($interview->status == 'Completed') {
            $interview->applicant->update(['status' => 'Interviewed']);
        }

        return back()->with('success', 'ইন্টারভিউ শিডিউল সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $interview = Interview::findOrFail($id);

        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'interviewer_name' => 'required|string|max:255',
            'interview_date' => 'required|date',
            'interview_time' => 'required',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:Scheduled,Completed,Cancelled',
            'remarks' => 'nullable|string',
        ]);

        $interview->update($request->all());

        if ($interview->status == 'Completed') {
            $interview->applicant->update(['status' => 'Interviewed']);
        }

        return back()->with('success', 'ইন্টারভিউ আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Scheduled,Completed,Cancelled',
        ]);

        $interview = Interview::findOrFail($id);
        $interview->update(['status' => $request->status]);

        if ($request->status == 'Completed') {
            $interview->applicant->update(['status' => 'Interviewed']);
        }

        return back()->with('success', 'স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        Interview::findOrFail($id)->delete();
        return back()->with('success', 'ইন্টারভিউ রেকর্ড মুছে ফেলা হয়েছে!');
    }
}
