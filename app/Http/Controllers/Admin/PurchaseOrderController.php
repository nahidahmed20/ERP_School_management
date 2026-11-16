<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campus;
use App\Models\PurchaseItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequest;
use App\Models\Vendor;
use App\Services\AccountingService;
use App\Services\InventoryService;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'request', 'items.purchaseItem']);

        if ($search = $request->get('search')) {
            $query->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('vendor', function ($q) use ($search) {
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
            'order' => null,
        ]);
    }

    public function store(Request $request)
    {
        $this->validateOrder($request);

        DB::transaction(function () use ($request) {
            $payload = $request->except(['cart', 'total_amount']);
            $payload['campus_id'] = config('app.active_campus_id');
            $payload['created_by'] = $request->user()->id;
            $payload['total_amount'] = collect($request->cart)->sum(fn ($item) => round((float) $item['quantity'] * (float) $item['unit_price'], 2));
            $order = PurchaseOrder::create($payload);

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
            'order' => $order,
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->validateOrder($request, $id);
        $order = PurchaseOrder::findOrFail($id);

        if ($order->status === 'Received') {
            return back()->with('error', 'Received purchase order edit করা যাবে না। আগে status পরিবর্তন করুন।');
        }
        abort_unless($order->status === 'Pending', 422, 'Only pending purchase orders can be edited.');

        DB::transaction(function () use ($request, $order) {
            $payload = $request->except(['cart', 'total_amount', 'campus_id']);
            $payload['total_amount'] = collect($request->cart)->sum(fn ($item) => round((float) $item['quantity'] * (float) $item['unit_price'], 2));
            $order->update($payload);
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

        $newStatus = $request->status;

        DB::transaction(function () use ($id, $newStatus, $request) {
            $order = PurchaseOrder::with('items.purchaseItem')->whereKey($id)->lockForUpdate()->firstOrFail();
            $allowed = ['Pending' => ['Ordered', 'Cancelled'], 'Ordered' => ['Received', 'Cancelled'], 'Received' => [], 'Cancelled' => []];
            abort_unless(in_array($newStatus, $allowed[$order->status] ?? [], true), 422, 'Invalid purchase order status transition.');
            if ($newStatus === 'Received') {
                abort_if((int) $order->created_by === (int) $request->user()->id, 403, 'Purchase creator cannot receive their own order.');
                foreach ($order->items as $item) {
                    app(InventoryService::class)->move($item->purchaseItem, $item->quantity, 'purchase_receipt', $item, "Purchase {$order->order_number}");
                }
                app(AccountingService::class)->post("purchase:{$order->id}", $order, '1200', '2000', (float) $order->total_amount, "Purchase {$order->order_number}", $order->order_date);
            }
            $order->update(['status' => $newStatus, 'received_by' => $newStatus === 'Received' ? $request->user()->id : null, 'received_at' => $newStatus === 'Received' ? now() : null]);
        });

        return back()->with('success', 'অর্ডারের স্ট্যাটাস আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        $order = PurchaseOrder::with('items.purchaseItem')->findOrFail($id);
        abort_unless(in_array($order->status, ['Pending', 'Cancelled'], true), 422, 'Ordered or received purchases cannot be deleted.');
        DB::transaction(function () use ($order) {
            if ($order->status === 'Received') {
                foreach ($order->items as $item) {
                    app(InventoryService::class)->move($item->purchaseItem, -$item->quantity, 'purchase_reversal', $item, "Deleted purchase {$order->order_number}");
                }
                app(AccountingService::class)->reverseSource($order);
            }
            $order->delete();
        });

        return back()->with('success', 'অর্ডারটি মুছে ফেলা হয়েছে।');
    }

    private function validateOrder(Request $request, $ignoreId = null)
    {
        $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'vendor_id' => ['required', CampusRule::exists('vendors')],
            'order_number' => ['required', 'string', Rule::unique('purchase_orders')->ignore($ignoreId)],
            'order_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0',
            'cart' => 'required|array|min:1',
            'cart.*.purchase_item_id' => ['required', CampusRule::exists('purchase_items')],
            'cart.*.size' => 'nullable|string',
            'cart.*.color' => 'nullable|string',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.unit_price' => 'required|numeric|min:0',
        ]);
    }
}
