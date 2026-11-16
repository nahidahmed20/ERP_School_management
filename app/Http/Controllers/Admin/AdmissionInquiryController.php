<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionInquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdmissionInquiryController extends Controller
{
    private function getCampusId()
    {
        return config('app.active_campus_id') ?? auth()->user()->campus_id;
    }

    public function index(Request $request)
    {
        $query = AdmissionInquiry::where('campus_id', $this->getCampusId());

        if ($search = $request->search) {
            $query->where(function($q) use ($search) {
                $q->where('applicant_name', 'like', "%{$search}%")
                  ->orWhere('guardian_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $inquiries = $query->latest('inquiry_date')->paginate(\App\Support\PerPage::resolve())->withQueryString();

        return Inertia::render('Admin/FrontOfficeAdmissionInquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'applicant_name' => 'required|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'class_interested' => 'required|string|max:255',
            'inquiry_date' => 'required|date',
            'status' => 'required|in:Pending,Follow-up,Converted,Cancelled',
        ]);

        $data = $request->all();
        $data['campus_id'] = $this->getCampusId(); 

        AdmissionInquiry::create($data);

        return back()->with('success', 'ভর্তির খোঁজখবর সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $inquiry = AdmissionInquiry::where('campus_id', $this->getCampusId())->findOrFail($id);
        
        $request->validate([
            'applicant_name' => 'required|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'class_interested' => 'required|string|max:255',
            'inquiry_date' => 'required|date',
            'status' => 'required|in:Pending,Follow-up,Converted,Cancelled',
        ]);

        $inquiry->update($request->all());

        return back()->with('success', 'তথ্য সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        AdmissionInquiry::where('campus_id', $this->getCampusId())->findOrFail($id)->delete();
        
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }
}