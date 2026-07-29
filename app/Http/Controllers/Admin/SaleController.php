<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('seller');

        if ($search = $request->get('search')) {
            $query->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
        }

        $query->latest();

        $perPage = $request->get('per_page', 10);
        $sales = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        $inventory_items = PurchaseItem::where('is_active', true)
                                       ->where('quantity', '>', 0)
                                       ->select('id', 'name', 'item_code', 'unit', 'selling_price', 'size', 'color', 'quantity')
                                       ->get();

        return Inertia::render('Admin/Sales/POS', [
            'inventory_items' => $inventory_items,
            'sale' => null
        ]);
    }

    public function store(Request $request)
    {
        $this->validateSale($request);

        DB::transaction(function () use ($request) {
            $invoice_number = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $sale = Sale::create([
                'invoice_number' => $invoice_number,
                'campus_id' => session('active_campus_id'),
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name ?? 'Walk-in Customer',
                'customer_phone' => $request->customer_phone,
                'subtotal' => $request->subtotal,
                'discount' => $request->discount ?? 0,
                'total_amount' => $request->total_amount,
                'paid_amount' => $request->paid_amount,
                'due_amount' => $request->total_amount - $request->paid_amount,
                'payment_method' => $request->payment_method ?? 'Cash',
            ]);

            foreach ($request->cart as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                PurchaseItem::where('id', $item['purchase_item_id'])->decrement('quantity', $item['quantity']);
            }
        });

        return redirect()->route('admin.sales.index')->with('success', 'বিক্রি সফলভাবে সম্পন্ন হয়েছে!');
    }

    public function invoice($id)
    {
        $sale = Sale::with(['items.product', 'seller'])->findOrFail($id);
        return Inertia::render('Admin/Sales/Invoice', ['sale' => $sale]);
    }

    public function edit($id)
    {
        $sale = Sale::with('items')->findOrFail($id);
        $inventory_items = PurchaseItem::where('is_active', true)
                                       ->select('id', 'name', 'item_code', 'unit', 'selling_price', 'size', 'color', 'quantity')
                                       ->get();

        return Inertia::render('Admin/Sales/POS', [
            'inventory_items' => $inventory_items,
            'sale' => $sale
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->validateSale($request);
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($request, $sale) {
            foreach ($sale->items as $oldItem) {
                PurchaseItem::where('id', $oldItem->purchase_item_id)->increment('quantity', $oldItem->quantity);
            }

            $sale->items()->delete();

            $sale->update([
                'customer_name' => $request->customer_name ?? 'Walk-in Customer',
                'customer_phone' => $request->customer_phone,
                'subtotal' => $request->subtotal,
                'discount' => $request->discount ?? 0,
                'total_amount' => $request->total_amount,
                'paid_amount' => $request->paid_amount,
                'due_amount' => $request->total_amount - $request->paid_amount,
                'payment_method' => $request->payment_method ?? 'Cash',
            ]);

            foreach ($request->cart as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                PurchaseItem::where('id', $item['purchase_item_id'])->decrement('quantity', $item['quantity']);
            }
        });

        return redirect()->route('admin.sales.index')->with('success', 'বিক্রির তথ্য আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                PurchaseItem::where('id', $item->purchase_item_id)->increment('quantity', $item->quantity);
            }
            $sale->delete();
        });

        return back()->with('success', 'বিল মুছে ফেলা হয়েছে এবং স্টক ফেরত এসেছে।');
    }

    // --- Validation Logic ---
    private function validateSale(Request $request)
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'cart' => 'required|array|min:1',
            'cart.*.purchase_item_id' => 'required|exists:purchase_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.unit_price' => 'required|numeric|min:0',
        ]);
    }
}
