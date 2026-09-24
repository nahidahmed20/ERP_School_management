<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\PaymentTransaction;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Services\AccountingService;
use App\Services\InventoryService;
use App\Support\CampusRule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->campusId();
        $query = Sale::with('seller');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $query->latest();
        $perPage = $request->get('per_page', 10);

        $sales = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        $voidRequests = DB::table('sale_void_requests')
            ->join('sales', 'sales.id', '=', 'sale_void_requests.sale_id')
            ->where('sale_void_requests.campus_id', config('app.active_campus_id'))
            ->where('sale_void_requests.status', 'pending')
            ->select('sale_void_requests.*', 'sales.invoice_number', 'sales.total_amount')
            ->latest('sale_void_requests.id')
            ->get();

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'voidRequests' => $voidRequests,
            'accounts' => $this->settlementAccounts(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->campusId();
        $inventory_items = PurchaseItem::where('is_active', true)
            ->where('quantity', '>', 0)
            ->select('id', 'name', 'item_code', 'unit', 'selling_price', 'size', 'color', 'quantity', 'purchase_price')
            ->get();

        $accounts = $this->settlementAccounts();

        return Inertia::render('Admin/Sales/POS', [
            'inventory_items' => $inventory_items,
            'accounts' => $accounts,
            'sale' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->campusId();
        $validated = $this->validateSale($request);

        DB::transaction(function () use ($request, $validated) {
            $invoice_number = 'INV-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));

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
                'due_amount' => round($total - $paid, 2),
                'payment_method' => $request->payment_method ?? 'Cash',
                'account_id' => $validated['account_id'],
            ]);

            $inventoryService = app(InventoryService::class);

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

                $inventoryService->move($item['product'], -$item['quantity'], 'sale', $saleItem, "Sale {$invoice_number}");
            }

            $this->syncSaleFinance($sale, $request->account_id);
        });

        return redirect()->route('admin.sales.index')->with('success', 'বিক্রি সফলভাবে সম্পন্ন হয়েছে!');
    }

    public function invoice(int $id): Response
    {
        $this->campusId();
        $sale = Sale::with(['items.product', 'seller'])->findOrFail($id);

        return Inertia::render('Admin/Sales/Invoice', ['sale' => $sale]);
    }

    public function edit(int $id): Response
    {
        $this->campusId();
        $sale = Sale::with('items')->findOrFail($id);
        
        $inventory_items = PurchaseItem::where('is_active', true)
            ->select('id', 'name', 'item_code', 'unit', 'selling_price', 'size', 'color', 'quantity', 'purchase_price')
            ->get();

        $accounts = $this->settlementAccounts();

        return Inertia::render('Admin/Sales/POS', [
            'inventory_items' => $inventory_items,
            'accounts' => $accounts,
            'sale' => $sale,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $this->campusId();
        $validated = $this->validateSale($request);
        $sale = Sale::with('items.product')->findOrFail($id);
        abort_if($sale->voided_at, 422, 'A voided sale cannot be edited.');
        abort_if(PaymentTransaction::where('source_type', Sale::class)->where('source_id', $sale->id)->where('status', 'Completed')->exists(), 422, 'This sale is already posted. Use the approved void workflow, then create a replacement sale.');

        DB::transaction(function () use ($request, $validated, $sale) {
            $inventoryService = app(InventoryService::class);

            foreach ($sale->items as $oldItem) {
                if ($oldItem->product) {
                    $inventoryService->move($oldItem->product, $oldItem->quantity, 'sale_reversal', $oldItem, "Edit reversal {$sale->invoice_number}");
                }
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
                'due_amount' => round($total - $paid, 2),
                'payment_method' => $request->payment_method ?? 'Cash',
                'account_id' => $validated['account_id'],
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

                $inventoryService->move($item['product'], -$item['quantity'], 'sale', $saleItem, "Sale Update {$sale->invoice_number}");
            }

            $this->syncSaleFinance($sale->fresh('items'), $request->account_id);
        });

        return redirect()->route('admin.sales.index')->with('success', 'বিক্রির তথ্য এবং অ্যাকাউন্ট আপডেট হয়েছে!');
    }

    public function destroy(int $id): RedirectResponse
    {
        return back()->with('error', 'Direct sale deletion is disabled. Use the approved void workflow.');
    }

    public function requestVoid(Request $request, Sale $sale): RedirectResponse
    {
        $this->campusId();
        $data = $request->validate(['reason' => 'required|string|max:1000']);
        
        abort_if($sale->voided_at, 422, 'This sale is already voided.');
        
        $hasPendingRequest = DB::table('sale_void_requests')
            ->where('sale_id', $sale->id)
            ->where('status', 'pending')
            ->exists();
            
        abort_if($hasPendingRequest, 422, 'A void request is already pending.');
        
        DB::table('sale_void_requests')->insert([
            'campus_id' => $sale->campus_id,
            'sale_id' => $sale->id,
            'reason' => $data['reason'],
            'status' => 'pending',
            'requested_by' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Sale void request submitted for approval.');
    }

    public function decideVoid(Request $request, int $voidRequest): RedirectResponse
    {
        $this->campusId();
        $data = $request->validate(['decision' => 'required|in:approved,rejected']);
        
        DB::transaction(function () use ($request, $voidRequest, $data) {
            $void = DB::table('sale_void_requests')
                ->where('campus_id', config('app.active_campus_id'))
                ->where('id', $voidRequest)
                ->lockForUpdate()
                ->first();
                
            abort_unless($void && $void->status === 'pending', 422, 'Void request is unavailable or already decided.');
            abort_if((int) $void->requested_by === (int) $request->user()->id, 403, 'Requester cannot decide their own void request.');
            
            $sale = Sale::with('items.product')->whereKey($void->sale_id)->lockForUpdate()->firstOrFail();
            
            if ($data['decision'] === 'approved') {
                abort_if($sale->voided_at, 422, 'This sale is already voided.');
                
                $inventoryService = app(InventoryService::class);
                foreach ($sale->items as $item) {
                    if ($item->product) {
                        $inventoryService->move($item->product, $item->quantity, 'sale_void', $item, "Approved void {$sale->invoice_number}");
                    }
                }
                
                app(AccountingService::class)->reverseSource($sale);
                
                PaymentTransaction::where('source_type', Sale::class)
                    ->where('source_id', $sale->id)
                    ->update([
                        'status' => 'Refunded',
                        'refunded_amount' => DB::raw('amount')
                    ]);
                    
                $sale->update(['voided_at' => now(), 'voided_by' => $request->user()->id]);
            }
            
            DB::table('sale_void_requests')->where('id', $voidRequest)->update([
                'status' => $data['decision'],
                'approved_by' => $request->user()->id,
                'decided_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Sale void decision recorded.');
    }

    private function validateSale(Request $request): array
    {
        return $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => ['required', 'in:Cash,bKash,Card,Bank'],
            'account_id' => ['required', CampusRule::exists('accounts'), function ($attribute, $value, $fail) {
                if (! Account::whereKey($value)->where('type', 'Asset')->where('is_active', true)->exists()) {
                    $fail('Select an active asset account for cash, bank, mobile banking, or card settlement.');
                }
            }],
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
                throw ValidationException::withMessages([
                    'cart' => "{$product->name}-এর পর্যাপ্ত stock নেই। (স্টকে আছে: {$product->quantity})"
                ]);
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

    private function syncSaleFinance(Sale $sale, int $requestAccountId): void
    {
        $accounting = app(AccountingService::class);
        $date = $sale->created_at?->toDateString() ?? now()->toDateString();
        
        $targetAccount = Account::whereKey($requestAccountId)->where('type', 'Asset')->where('is_active', true)->firstOrFail();

        $accounting->reverseSource($sale);
        
        $accounting->post("sale:{$sale->id}:paid", $sale, $targetAccount, '4100', (float) $sale->paid_amount, "Sale {$sale->invoice_number}", $date, 'Receipt');
        
        $accounting->post("sale:{$sale->id}:due", $sale, '1100', '4100', (float) $sale->due_amount, "Sale due {$sale->invoice_number}", $date);
        
        $cost = $sale->items->sum(fn ($item) => (float) $item->unit_cost * (int) $item->quantity);
        $accounting->post("sale:{$sale->id}:cogs", $sale, '5000', '1200', $cost, "COGS {$sale->invoice_number}", $date);

        if ((float) $sale->paid_amount > 0) {
            PaymentTransaction::updateOrCreate(
                ['source_type' => Sale::class, 'source_id' => $sale->id],
                [
                    'transaction_id' => 'SALE-' . $sale->invoice_number,
                    'reference_no' => $sale->invoice_number,
                    'amount' => $sale->paid_amount,
                    'currency' => 'BDT',
                    'payment_method' => $sale->payment_method,
                    'status' => 'Completed',
                    'transaction_date' => $date,
                    'campus_id' => $sale->campus_id,
                    'account_id' => $targetAccount->id,
                ]
            );
        }
    }

    public function report(Request $request): Response
    {
        $this->campusId();
        $query = Sale::with('items.product', 'seller')->whereNull('voided_at');

        if ($request->filled(['start_date', 'end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->latest()->get();

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

    public function receiveDue(Request $request, Sale $sale): RedirectResponse
    {
        $this->campusId();
        abort_if($sale->voided_at, 422, 'A voided sale cannot receive a due payment.');
        $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:' . $sale->due_amount],
            'payment_method' => ['required', 'string', 'in:Cash,bKash,Card,Bank'],
            'account_id' => ['required', CampusRule::exists('accounts'), function ($attribute, $value, $fail) {
                if (! Account::whereKey($value)->where('type', 'Asset')->where('is_active', true)->exists()) {
                    $fail('Select an active asset settlement account.');
                }
            }],
            'reference_no' => ['nullable', 'string', 'max:100'],
        ], [
            'amount.max' => "আপনি ৳{$sale->due_amount} এর চেয়ে বেশি টাকা রিসিভ করতে পারবেন না।"
        ]);

        DB::transaction(function () use ($request, $sale) {
            $sale = Sale::whereKey($sale->id)->lockForUpdate()->firstOrFail();
            abort_if($sale->voided_at, 422, 'A voided sale cannot receive a due payment.');
            $received = (float) $request->amount;
            if ($received > (float) $sale->due_amount + .001) {
                throw ValidationException::withMessages(['amount' => 'Payment exceeds the remaining due amount.']);
            }
            $transactionId = 'DUE-' . $sale->invoice_number . '-' . Str::upper(Str::random(8));

            $sale->paid_amount += $received;
            $sale->due_amount -= $received;
            $sale->save();

            PaymentTransaction::create([
                'campus_id' => $sale->campus_id,
                'source_type' => Sale::class,
                'source_id' => $sale->id,
                'transaction_id' => $transactionId,
                'reference_no' => $request->reference_no ?? $sale->invoice_number,
                'amount' => $received,
                'currency' => 'BDT',
                'payment_method' => $request->payment_method,
                'status' => 'Completed',
                'transaction_date' => now()->toDateString(),
                'account_id' => $request->account_id,
            ]);

            $targetAccount = Account::whereKey($request->account_id)->where('type', 'Asset')->where('is_active', true)->firstOrFail();

            $accounting = app(AccountingService::class);
            $accounting->post(
                "sale:{$sale->id}:due_received:{$transactionId}",
                $sale,
                $targetAccount,
                '1100', // Accounts Receivable (Due) Account
                $received,
                "Due received for invoice {$sale->invoice_number}",
                now()->toDateString(),
                'Receipt'
            );
        });

        return back()->with('success', 'বাকির টাকা সফলভাবে রিসিভ করা হয়েছে!');
    }

    private function settlementAccounts()
    {
        return Account::where('is_active', true)->where('type', 'Asset')
            ->select('id', 'name', 'code', 'type')->orderBy('code')->get();
    }

    private function campusId(): int
    {
        $campusId = (int) config('app.active_campus_id');
        abort_if(! $campusId, 422, 'Select a campus before processing a sale.');
        return $campusId;
    }
}
