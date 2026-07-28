<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobPostController extends Controller
{
    public function index(Request $request)
    {
        $query = JobPost::query();

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $jobPosts = $query->latest('created_at')->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/RecruitmentJobPosts/Index', [
            'jobPosts' => $jobPosts,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'employment_type' => 'required|string',
            'vacancies' => 'required|integer|min:1',
            'deadline' => 'required|date',
            'status' => 'required|in:Open,Closed',
        ]);

        JobPost::create($request->all());

        return back()->with('success', 'জব পোস্ট সফলভাবে তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $jobPost = JobPost::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'employment_type' => 'required|string',
            'vacancies' => 'required|integer|min:1',
            'deadline' => 'required|date',
            'status' => 'required|in:Open,Closed',
        ]);

        $jobPost->update($request->all());

        return back()->with('success', 'জব পোস্ট আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        JobPost::findOrFail($id)->delete();
        return back()->with('success', 'জব পোস্ট মুছে ফেলা হয়েছে!');
    }
}