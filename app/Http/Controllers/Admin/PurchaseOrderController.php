<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseItem;
use App\Models\PurchaseRequest;
use App\Models\Vendor;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'request', 'items.purchaseItem']);

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
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/PurchaseOrders/CreateEdit', [
            'campuses' => Campus::select('id', 'name')->get(),
            'vendors' => Vendor::where('is_active', true)->select('id', 'name')->get(),
            'purchase_requests' => PurchaseRequest::where('status', 'Approved')->select('id', 'title', 'estimated_amount')->get(),
            'inventory_items' => PurchaseItem::where('is_active', true)->select('id', 'name', 'item_code', 'unit', 'purchase_price', 'size', 'color')->get(),
            'order' => null
        ]);
    }

    public function store(Request $request)
    {
        $this->validateOrder($request);

        DB::transaction(function () use ($request) {
            $order = PurchaseOrder::create($request->except('cart'));

            foreach ($request->cart as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('admin.purchases.orders.index')->with('success', 'Purchase Order সফলভাবে তৈরি হয়েছে।');
    }

    public function edit($id)
    {
        $order = PurchaseOrder::with('items')->findOrFail($id);

        return Inertia::render('Admin/PurchaseOrders/CreateEdit', [
            'campuses' => Campus::select('id', 'name')->get(),
            'vendors' => Vendor::where('is_active', true)->select('id', 'name')->get(),
            'purchase_requests' => PurchaseRequest::where('status', 'Approved')->select('id', 'title', 'estimated_amount')->get(),
            'inventory_items' => PurchaseItem::where('is_active', true)->select('id', 'name', 'item_code', 'unit', 'purchase_price', 'size', 'color')->get(),
            'order' => $order
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->validateOrder($request, $id);
        $order = PurchaseOrder::findOrFail($id);

        DB::transaction(function () use ($request, $order) {
            $order->update($request->except('cart'));
            $order->items()->delete();

            foreach ($request->cart as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('admin.purchases.orders.index')->with('success', 'Purchase Order আপডেট হয়েছে।');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Ordered,Received,Cancelled']);

        $order = PurchaseOrder::with('items')->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;

        DB::transaction(function () use ($order, $oldStatus, $newStatus) {
            if ($oldStatus !== 'Received' && $newStatus === 'Received') {
                foreach($order->items as $item) {
                    PurchaseItem::where('id', $item->purchase_item_id)->increment('quantity', $item->quantity);
                }
            } elseif ($oldStatus === 'Received' && $newStatus !== 'Received') {
                foreach($order->items as $item) {
                    PurchaseItem::where('id', $item->purchase_item_id)->decrement('quantity', $item->quantity);
                }
            }
            $order->update(['status' => $newStatus]);
        });

        return back()->with('success', 'অর্ডারের স্ট্যাটাস আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        PurchaseOrder::findOrFail($id)->delete();
        return back()->with('success', 'অর্ডারটি মুছে ফেলা হয়েছে।');
    }

    private function validateOrder(Request $request, $ignoreId = null)
    {
        $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'vendor_id' => 'required|exists:vendors,id',
            'order_number' => ['required', 'string', Rule::unique('purchase_orders')->ignore($ignoreId)],
            'order_date' => 'required|date',
            'total_amount' => 'required|numeric',
            'cart' => 'required|array|min:1',
            'cart.*.purchase_item_id' => 'required|exists:purchase_items,id',
            'cart.*.size' => 'nullable|string',
            'cart.*.color' => 'nullable|string',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.unit_price' => 'required|numeric|min:0',
        ]);
    }
}
