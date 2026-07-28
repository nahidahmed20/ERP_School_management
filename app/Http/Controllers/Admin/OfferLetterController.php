<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfferLetter;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfferLetterController extends Controller
{
    public function index(Request $request)
    {
        $query = OfferLetter::with(['applicant.jobPost']);

        if ($search = $request->search) {
            $query->whereHas('applicant', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $offerLetters = $query->latest('issue_date')->paginate($request->per_page ?? 10)->withQueryString();

        $applicants = Applicant::whereIn('status', ['Interviewed', 'Hired'])
                                ->with('jobPost')
                                ->latest()
                                ->get();

        return Inertia::render('Admin/RecruitmentOfferLetters/Index', [
            'offerLetters' => $offerLetters,
            'applicants' => $applicants,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id|unique:offer_letters,applicant_id', // একজনের একটাই অফার লেটার হবে
            'issue_date' => 'required|date',
            'joining_date' => 'required|date',
            'salary_offered' => 'required|string|max:255',
            'valid_until' => 'required|date',
            'status' => 'required|in:Pending,Accepted,Declined',
            'terms_conditions' => 'nullable|string',
        ], [
            'applicant_id.unique' => 'এই আবেদনকারীর জন্য আগে থেকেই একটি অফার লেটার তৈরি করা আছে।'
        ]);

        $offerLetter = OfferLetter::create($request->all());

        $offerLetter->applicant->update(['status' => 'Hired']);

        return back()->with('success', 'অফার লেটার সফলভাবে তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $offerLetter = OfferLetter::findOrFail($id);

        $request->validate([
            'applicant_id' => 'required|exists:applicants,id|unique:offer_letters,applicant_id,'.$id,
            'issue_date' => 'required|date',
            'joining_date' => 'required|date',
            'salary_offered' => 'required|string|max:255',
            'valid_until' => 'required|date',
            'status' => 'required|in:Pending,Accepted,Declined',
            'terms_conditions' => 'nullable|string',
        ]);

        $offerLetter->update($request->all());

        return back()->with('success', 'অফার লেটার আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Accepted,Declined',
        ]);

        $offerLetter = OfferLetter::findOrFail($id);
        $offerLetter->update(['status' => $request->status]);

        return back()->with('success', 'স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        OfferLetter::findOrFail($id)->delete();
        return back()->with('success', 'অফার লেটার মুছে ফেলা হয়েছে!');
    }
}
