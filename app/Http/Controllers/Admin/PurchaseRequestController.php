<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseRequest::with('requester');

        if ($search = $request->get('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhereHas('requester', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $requests = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/PurchaseRequests/Index', [
            'requests' => $requests,
            'campuses' => Campus::select('id', 'name')->get(),
            'users' => User::select('id', 'name', 'email')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        PurchaseRequest::create($data);
        return back()->with('success', 'নতুন Purchase Request তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $purchaseReq = PurchaseRequest::findOrFail($id);
        $data = $this->validateData($request);
        $purchaseReq->update($data);
        return back()->with('success', 'Purchase Request আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        PurchaseRequest::findOrFail($id)->delete();
        return back()->with('success', 'রিকুয়েস্ট মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'requested_by' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'estimated_amount' => 'required|numeric|min:0',
            'expected_date' => 'required|date',
            'status' => 'required|in:Pending,Approved,Rejected,Completed',
            'admin_remark' => 'nullable|string',
        ]);
    }
}
