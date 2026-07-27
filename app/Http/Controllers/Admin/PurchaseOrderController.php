<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Vendor;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'request']);

        if ($search = $request->get('search')) {
            $query->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $query->latest('order_date');

        $perPage = $request->get('per_page', 10);
        $orders = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/PurchaseOrders/Index', [
            'orders' => $orders,
            'campuses' => Campus::select('id', 'name')->get(),
            'vendors' => Vendor::where('is_active', true)->select('id', 'name')->get(),
            'purchase_requests' => PurchaseRequest::where('status', 'Approved')->select('id', 'title', 'estimated_amount')->get(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        PurchaseOrder::create($data);
        return back()->with('success', 'নতুন Purchase Order তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $order = PurchaseOrder::findOrFail($id);
        $data = $this->validateData($request, $order->id);
        $order->update($data);
        return back()->with('success', 'Purchase Order আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        PurchaseOrder::findOrFail($id)->delete();
        return back()->with('success', 'অর্ডারটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? session('active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'vendor_id' => 'required|exists:vendors,id',
            'purchase_request_id' => 'nullable|exists:purchase_requests,id',
            'order_number' => [
                'required', 'string', 'max:100',
                Rule::unique('purchase_orders', 'order_number')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'order_date' => 'required|date',
            'delivery_date' => 'nullable|date|after_or_equal:order_date',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:Pending,Ordered,Received,Cancelled',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
    }
}
