<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Services\AccountingService;
use App\Services\InventoryService;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

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
            'voidRequests' => DB::table('sale_void_requests')->join('sales', 'sales.id', '=', 'sale_void_requests.sale_id')
                ->where('sale_void_requests.campus_id', config('app.active_campus_id'))->where('sale_void_requests.status', 'pending')
                ->select('sale_void_requests.*', 'sales.invoice_number', 'sales.total_amount')->latest('sale_void_requests.id')->get(),
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
            'sale' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateSale($request);

        DB::transaction(function () use ($request, $validated) {
            $invoice_number = 'INV-'.date('Ymd').'-'.strtoupper(substr(uniqid(), -4));

            $lines = $this->prepareLines($validated['cart']);
            $subtotal = collect($lines)->sum('subtotal');
            $discount = min((float) ($validated['discount'] ?? 0), $subtotal);
            $total = round($subtotal - $discount, 2);
            $paid = min((float) $validated['paid_amount'], $total);

            $sale = Sale::create([
                'invoice_number' => $invoice_number,
                'campus_id' => config('app.active_campus_id'),
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name ?? 'Walk-in Customer',
                'customer_phone' => $request->customer_phone,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_amount' => $total,
                'paid_amount' => $paid,
                'due_amount' => $total - $paid,
                'payment_method' => $request->payment_method ?? 'Cash',
            ]);

            foreach ($lines as $item) {
                $saleItem = SaleItem::create([
                    'sale_id' => $sale->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                app(InventoryService::class)->move($item['product'], -$item['quantity'], 'sale', $saleItem, "Sale {$invoice_number}");
            }

            $this->syncSaleFinance($sale);
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
            'sale' => $sale,
        ]);
    }

    public function update(Request $request, $id)
    {
        abort(422, 'Posted sales cannot be edited. Submit a void request and create a corrected sale.');
        $validated = $this->validateSale($request);
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($request, $validated, $sale) {
            foreach ($sale->items as $oldItem) {
                app(InventoryService::class)->move($oldItem->product, $oldItem->quantity, 'sale_reversal', $oldItem, "Edit reversal {$sale->invoice_number}");
            }

            $sale->items()->delete();

            $lines = $this->prepareLines($validated['cart']);
            $subtotal = collect($lines)->sum('subtotal');
            $discount = min((float) ($validated['discount'] ?? 0), $subtotal);
            $total = round($subtotal - $discount, 2);
            $paid = min((float) $validated['paid_amount'], $total);

            $sale->update([
                'customer_name' => $request->customer_name ?? 'Walk-in Customer',
                'customer_phone' => $request->customer_phone,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_amount' => $total,
                'paid_amount' => $paid,
                'due_amount' => $total - $paid,
                'payment_method' => $request->payment_method ?? 'Cash',
            ]);

            foreach ($lines as $item) {
                $saleItem = SaleItem::create([
                    'sale_id' => $sale->id,
                    'purchase_item_id' => $item['purchase_item_id'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                app(InventoryService::class)->move($item['product'], -$item['quantity'], 'sale', $saleItem, "Sale {$sale->invoice_number}");
            }

            $this->syncSaleFinance($sale->fresh('items'));
        });

        return redirect()->route('admin.sales.index')->with('success', 'বিক্রির তথ্য আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        return back()->with('error', 'Direct sale deletion is disabled. Use the approved void workflow.');
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                app(InventoryService::class)->move($item->product, $item->quantity, 'sale_reversal', $item, "Void {$sale->invoice_number}");
            }
            app(AccountingService::class)->reverseSource($sale);
            PaymentTransaction::where('source_type', Sale::class)->where('source_id', $sale->id)
                ->update(['status' => 'Refunded']);
            $sale->delete();
        });

        return back()->with('success', 'বিল মুছে ফেলা হয়েছে এবং স্টক ফেরত এসেছে।');
    }

    public function requestVoid(Request $request, Sale $sale)
    {
        $data = $request->validate(['reason' => 'required|string|max:1000']);
        abort_if($sale->voided_at, 422, 'This sale is already voided.');
        abort_if(DB::table('sale_void_requests')->where('sale_id', $sale->id)->where('status', 'pending')->exists(), 422, 'A void request is already pending.');
        DB::table('sale_void_requests')->insert(['campus_id' => $sale->campus_id, 'sale_id' => $sale->id, 'reason' => $data['reason'], 'status' => 'pending', 'requested_by' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Sale void request submitted for approval.');
    }

    public function decideVoid(Request $request, int $voidRequest)
    {
        $data = $request->validate(['decision' => 'required|in:approved,rejected']);
        DB::transaction(function () use ($request, $voidRequest, $data) {
            $void = DB::table('sale_void_requests')->where('campus_id', config('app.active_campus_id'))->where('id', $voidRequest)->lockForUpdate()->first();
            abort_unless($void && $void->status === 'pending', 422, 'Void request is unavailable or already decided.');
            abort_if((int) $void->requested_by === (int) $request->user()->id, 403, 'Requester cannot decide their own void request.');
            $sale = Sale::with('items.product')->whereKey($void->sale_id)->lockForUpdate()->firstOrFail();
            if ($data['decision'] === 'approved') {
                abort_if($sale->voided_at, 422, 'This sale is already voided.');
                foreach ($sale->items as $item) {
                    app(InventoryService::class)->move($item->product, $item->quantity, 'sale_void', $item, "Approved void {$sale->invoice_number}");
                }
                app(AccountingService::class)->reverseSource($sale);
                PaymentTransaction::where('source_type', Sale::class)->where('source_id', $sale->id)->update(['status' => 'Refunded', 'refunded_amount' => DB::raw('amount')]);
                $sale->update(['voided_at' => now(), 'voided_by' => $request->user()->id]);
            }
            DB::table('sale_void_requests')->where('id', $voidRequest)->update(['status' => $data['decision'], 'approved_by' => $request->user()->id, 'decided_at' => now(), 'updated_at' => now()]);
        });

        return back()->with('success', 'Sale void decision recorded.');
    }

    // --- Validation Logic ---
    private function validateSale(Request $request): array
    {
        return $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'cart' => 'required|array|min:1',
            'cart.*.purchase_item_id' => ['required', CampusRule::exists('purchase_items')],
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.unit_price' => 'required|numeric|min:0',
        ]);
    }

    private function prepareLines(array $cart): array
    {
        $lines = [];
        foreach ($cart as $line) {
            $product = PurchaseItem::query()->lockForUpdate()->findOrFail($line['purchase_item_id']);
            $quantity = (int) $line['quantity'];
            if ($product->quantity < $quantity) {
                throw ValidationException::withMessages(['cart' => "{$product->name}-এর পর্যাপ্ত stock নেই।"]);
            }
            $price = round((float) $line['unit_price'], 2);
            $lines[] = $line + [
                'product' => $product,
                'unit_cost' => (float) $product->purchase_price,
                'subtotal' => round($quantity * $price, 2),
            ];
        }

        return $lines;
    }

    private function syncSaleFinance(Sale $sale): void
    {
        $accounting = app(AccountingService::class);
        $accounting->reverseSource($sale);
        $accounting->post("sale:{$sale->id}:paid", $sale, '1000', '4100', (float) $sale->paid_amount, "Sale {$sale->invoice_number}", $sale->created_at?->toDateString(), 'Receipt');
        $accounting->post("sale:{$sale->id}:due", $sale, '1100', '4100', (float) $sale->due_amount, "Sale due {$sale->invoice_number}", $sale->created_at?->toDateString());
        $cost = $sale->items->sum(fn ($item) => (float) $item->unit_cost * (int) $item->quantity);
        $accounting->post("sale:{$sale->id}:cogs", $sale, '5000', '1200', $cost, "COGS {$sale->invoice_number}", $sale->created_at?->toDateString());

        if ((float) $sale->paid_amount > 0) {
            PaymentTransaction::updateOrCreate(
                ['source_type' => Sale::class, 'source_id' => $sale->id],
                ['transaction_id' => 'SALE-'.$sale->invoice_number, 'reference_no' => $sale->invoice_number,
                    'amount' => $sale->paid_amount, 'currency' => 'BDT', 'payment_method' => $sale->payment_method,
                    'status' => 'Completed', 'transaction_date' => $sale->created_at?->toDateString() ?? now()->toDateString()]
            );
        }
    }

    public function report(Request $request)
    {
        $query = Sale::with('items.product', 'seller')->whereNull('voided_at');

        // Date range filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date.' 00:00:00',
                $request->end_date.' 23:59:59',
            ]);
        }

        // Payment method filter
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->latest()->get();

        // Summary calculations
        $summary = [
            'total_sales' => $sales->sum('total_amount'),
            'total_paid' => $sales->sum('paid_amount'),
            'total_due' => $sales->sum('due_amount'),
            'total_discount' => $sales->sum('discount'),
            'total_invoices' => $sales->count(),
        ];

        return Inertia::render('Admin/Sales/Reports/Index', [
            'sales' => $sales,
            'summary' => $summary,
            'filters' => $request->only(['start_date', 'end_date', 'payment_method']),
        ]);
    }
}
