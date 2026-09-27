<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaOrder;
use App\Models\CafeteriaOutlet;
use App\Models\CafeteriaWallet;
use App\Models\CafeteriaWalletTransaction;
use App\Models\FoodItem;
use App\Models\CafeteriaRawMaterial; 
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use App\Services\AccountingService;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CafeteriaOperationsController extends Controller
{
    private function raw(string $table)
    {
        return DB::table($table)->where($table.'.campus_id', config('app.active_campus_id'));
    }

    public function index()
    {
        $activeCampusId = config('app.active_campus_id');

        $wallets = CafeteriaWallet::with('user:id,name,email')->where('campus_id', $activeCampusId)->latest()->take(250)->get();
        $orders = CafeteriaOrder::with(['customer:id,name', 'outlet:id,name'])->where('campus_id', $activeCampusId)->latest()->take(150)->get();
        $today = today();
        $served = clone $orders->where('created_at', '>=', $today->startOfDay())->whereNotIn('status', ['Voided', 'Cancelled']);

        $consumption = $orders->whereNotIn('status', ['Voided', 'Cancelled'])
            ->flatMap(fn ($o) => collect($o->items)->map(fn ($i) => ['name' => $i['name'] ?? 'Item', 'quantity' => (int) ($i['quantity'] ?? 0), 'amount' => (float) ($i['subtotal'] ?? 0)]))
            ->groupBy('name')
            ->map(fn ($rows, $name) => ['name' => $name, 'quantity' => $rows->sum('quantity'), 'amount' => $rows->sum('amount')])
            ->sortByDesc('quantity')->values();

        $campusUsers = User::where('campus_id', $activeCampusId)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['Student', 'Teacher', 'Staff', 'student', 'teacher', 'staff']);
            })
            ->with(['student:id,user_id,admission_no,first_name,last_name', 'staff:id,user_id,staff_id_no,first_name,last_name'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'campus_id']);

        return Inertia::render('Admin/CafeteriaOperations/Index', [
            'wallets' => $wallets,
            'users' => $campusUsers,
            'outlets' => CafeteriaOutlet::where('campus_id', $activeCampusId)->where('is_active', true)->get(['id', 'name']),
            'foods' => FoodItem::whereHas('outlet', function($q) use ($activeCampusId) {
                $q->where('campus_id', $activeCampusId);
            })->with('outlet:id,name')->orderBy('name')->get(),
            
            'rawMaterials' => CafeteriaRawMaterial::where('campus_id', $activeCampusId)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'stock_quantity', 'reorder_level']),
            
            'orders' => $orders,
            'refunds' => $this->raw('cafeteria_refund_requests')->latest()->take(100)->get(),
            'closings' => $this->raw('cafeteria_cash_closings')->latest('business_date')->take(50)->get(),
            'consumption' => $consumption,
            'summary' => [
                'sales' => (float) $served->sum('total_amount'),
                'orders' => $served->count(),
                'walletBalance' => (float) CafeteriaWallet::where('campus_id', $activeCampusId)->sum('balance'),
                'lowStock' => FoodItem::whereHas('outlet', function($q) use ($activeCampusId) {
                    $q->where('campus_id', $activeCampusId);
                })->whereColumn('stock_quantity', '<=', 'reorder_level')->count(),
                'kitchenPending' => CafeteriaOrder::where('campus_id', $activeCampusId)->whereIn('status', ['Pending', 'Accepted', 'Preparing', 'Ready'])->count()
            ]
        ]);
    }

    public function wallet(Request $r)
    {
        $d = $r->validate(['user_id' => ['required', CampusRule::exists('users')], 'card_uid' => 'nullable|string|max:100|unique:cafeteria_wallets,card_uid', 'daily_spending_limit' => 'nullable|numeric|min:0']);
        CafeteriaWallet::updateOrCreate(['user_id' => $d['user_id']], $d + ['campus_id' => config('app.active_campus_id'), 'is_active' => true]);
        return back()->with('success', 'Wallet/card and spending limit saved.');
    }

    public function topup(Request $r)
    {
        $d = $r->validate(['cafeteria_wallet_id' => ['required', CampusRule::exists('cafeteria_wallets')], 'amount' => 'required|numeric|min:0.01', 'payment_method' => 'required|in:cash,bank,mobile_banking,online', 'reference_no' => 'nullable|string|max:100']);
        DB::transaction(function () use ($d, $r) {
            $w = CafeteriaWallet::lockForUpdate()->findOrFail($d['cafeteria_wallet_id']);
            $w->increment('balance', $d['amount']);
            $this->txn($w, 'topup', $d['amount'], 'topup', null, $r->user()->id, $d['payment_method'], $d['reference_no'] ?? null);
            app(AccountingService::class)->post('cafeteria-topup:'.$w->id.':'.now()->format('YmdHisv'), $w, '1000', '2500', (float) $d['amount'], 'Cafeteria wallet top-up', now()->toDateString(), 'Receipt');
        });
        return back()->with('success', 'Wallet top-up completed.');
    }

    public function identify(Request $r)
    {
        $code = $r->validate(['code' => 'required|string|max:255'])['code'];
        $wallet = CafeteriaWallet::with('user:id,name,email')->where('card_uid', $code)->first();
        if (! $wallet) {
            $userId = Student::where('admission_no', $code)->value('user_id') ?? Staff::where('staff_id_no', $code)->value('user_id') ?? User::where('email', $code)->value('id');
            $wallet = CafeteriaWallet::with('user:id,name,email')->where('user_id', $userId)->first();
        }
        return response()->json($wallet ?: ['message' => 'No active cafeteria wallet found'], $wallet ? 200 : 404);
    }

    public function purchase(Request $r)
    {
        $d = $r->validate(['identifier' => 'required|string|max:255', 'cafeteria_outlet_id' => ['required', CampusRule::exists('cafeteria_outlets')], 'payment_method' => 'required|in:wallet,cash', 'items' => 'required|array|min:1', 'items.*.food_item_id' => ['required', CampusRule::exists('food_items')], 'items.*.quantity' => 'required|integer|min:1']);
        $order = DB::transaction(function () use ($d, $r) {
            $wallet = $this->findWallet($d['identifier'], true);
            $items = [];
            $total = 0;
            foreach ($d['items'] as $line) {
                $food = FoodItem::lockForUpdate()->findOrFail($line['food_item_id']);
                if (! $food->is_available || $food->cafeteria_outlet_id != (int) $d['cafeteria_outlet_id']) {
                    throw ValidationException::withMessages(['items' => 'An item is unavailable or belongs to another outlet.']);
                }
                if ((float) $food->stock_quantity < $line['quantity']) {
                    throw ValidationException::withMessages(['items' => "{$food->name} stock is insufficient."]);
                }
                $subtotal = (float) $food->price * $line['quantity'];
                $total += $subtotal;
                $items[] = ['food_item_id' => $food->id, 'name' => $food->name, 'quantity' => $line['quantity'], 'unit_price' => (float) $food->price, 'subtotal' => $subtotal];
                
                $food->decrement('stock_quantity', $line['quantity']);

                if ($food->cafeteria_raw_material_id) {
                    $rawMaterial = CafeteriaRawMaterial::find($food->cafeteria_raw_material_id);
                    if ($rawMaterial) {
                        $rawMaterial->decrement('stock_quantity', $line['quantity']);
                    }
                }
            }
            if ($d['payment_method'] === 'wallet') {
                $spent = (float) CafeteriaWalletTransaction::where('cafeteria_wallet_id', $wallet->id)->where('type', 'purchase')->whereDate('created_at', today())->sum('amount');
                if ($wallet->daily_spending_limit !== null && $spent + $total > (float) $wallet->daily_spending_limit) {
                    throw ValidationException::withMessages(['identifier' => 'Daily parent spending limit exceeded.']);
                }if ((float) $wallet->balance < $total) {
                    throw ValidationException::withMessages(['identifier' => 'Insufficient wallet balance.']);
                }$wallet->decrement('balance', $total);
            }
            $order = CafeteriaOrder::create(['campus_id' => config('app.active_campus_id'), 'user_id' => $wallet->user_id, 'cafeteria_outlet_id' => $d['cafeteria_outlet_id'], 'order_number' => 'CF-'.now()->format('ymdHis').'-'.random_int(100, 999), 'total_amount' => $total, 'status' => 'Pending', 'payment_status' => 'Paid', 'payment_method' => $d['payment_method'], 'source' => 'id_card', 'items' => $items, 'processed_by' => $r->user()->id]);
            if ($d['payment_method'] === 'wallet') {
                $this->txn($wallet, 'purchase', $total, CafeteriaOrder::class, $order->id, $r->user()->id, 'wallet', $order->order_number);
            }
            
            $accounting = app(AccountingService::class);
            $accounting->post('cafeteria-sale:'.$order->id, $order, $d['payment_method'] === 'wallet' ? '2500' : '1000', '4200', $total, 'Cafeteria sale '.$order->order_number, now()->toDateString(), 'Receipt');

            return $order;
        });

        return back()->with('success', 'ID-card purchase accepted: '.$order->order_number);
    }

    public function kitchen(Request $r, CafeteriaOrder $order)
    {
        $d = $r->validate(['status' => 'required|in:Accepted,Preparing,Ready,Served']);
        $sequence = ['Pending' => 0, 'Accepted' => 1, 'Preparing' => 2, 'Ready' => 3, 'Served' => 4];
        if (($sequence[$d['status']] ?? 0) < ($sequence[$order->status] ?? 0)) {
            throw ValidationException::withMessages(['status' => 'Kitchen status cannot move backwards.']);
        }$field = ['Accepted' => 'accepted_at', 'Preparing' => 'preparing_at', 'Ready' => 'ready_at', 'Served' => 'served_at'][$d['status']];
        $order->update(['status' => $d['status'], $field => now(), 'processed_by' => $r->user()->id]);

        return back()->with('success', 'Kitchen order moved to '.$d['status'].'.');
    }

    public function refundRequest(Request $r, CafeteriaOrder $order)
    {
        $d = $r->validate(['type' => 'required|in:refund,void', 'amount' => 'required|numeric|min:0.01|max:'.$order->total_amount, 'reason' => 'required|string|max:1000']);
        $already = (float) $this->raw('cafeteria_refund_requests')->where('cafeteria_order_id', $order->id)->where('status', 'approved')->sum('amount');
        abort_if($already + (float) $d['amount'] > (float) $order->total_amount, 422, 'Refund total exceeds the order amount.');
        $this->raw('cafeteria_refund_requests')->insert($d + ['campus_id' => config('app.active_campus_id'), 'cafeteria_order_id' => $order->id, 'status' => 'pending', 'requested_by' => $r->user()->id, 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Refund/void sent for approval.');
    }

    public function refundDecision(Request $r, int $refund)
    {
        $d = $r->validate(['status' => 'required|in:approved,rejected']);
        DB::transaction(function () use ($d, $refund, $r) {
            $req = $this->raw('cafeteria_refund_requests')->where('id', $refund)->lockForUpdate()->first();
            if (! $req || $req->status !== 'pending') {
                throw ValidationException::withMessages(['status' => 'Request was already decided or is unavailable.']);
            }
            abort_if((int) $req->requested_by === (int) $r->user()->id, 403, 'Requester cannot approve their own refund or void.');
            $order = CafeteriaOrder::lockForUpdate()->findOrFail($req->cafeteria_order_id);
            $this->raw('cafeteria_refund_requests')->where('id', $refund)->update(['status' => $d['status'], 'approved_by' => $r->user()->id, 'decided_at' => now(), 'updated_at' => now()]);
            
            if ($d['status'] === 'approved') {
                app(AccountingService::class)->post('cafeteria-refund:'.$req->id, $order, '4200', $order->payment_method === 'wallet' ? '2500' : '1000', (float) $req->amount, 'Cafeteria refund '.$order->order_number, now()->toDateString(), 'Payment');
                if ($order->payment_method === 'wallet') {
                    $w = CafeteriaWallet::where('user_id', $order->user_id)->lockForUpdate()->firstOrFail();
                    $w->increment('balance', $req->amount);
                    $this->txn($w, 'refund', $req->amount, CafeteriaOrder::class, $order->id, $r->user()->id, 'wallet', $order->order_number);
                }
                if ($req->type === 'void') {
                    foreach ($order->items as $line) {
                        $food = FoodItem::find($line['food_item_id']);
                        $food?->increment('stock_quantity', $line['quantity']);
                        
                        if ($food?->cafeteria_raw_material_id) {
                            $rawMaterial = CafeteriaRawMaterial::find($food->cafeteria_raw_material_id);
                            if ($rawMaterial) {
                                $rawMaterial->increment('stock_quantity', $line['quantity']);
                            }
                        }
                    }
                    $order->update(['status' => 'Voided', 'payment_status' => 'Refunded']);
                } else {
                    $order->update(['payment_status' => 'Refunded']);
                }
            }
        });

        return back()->with('success', 'Refund/void decision recorded.');
    }

    public function closeCash(Request $r)
    {
        $d = $r->validate(['cafeteria_outlet_id' => 'required|exists:cafeteria_outlets,id', 'business_date' => 'required|date', 'opening_cash' => 'required|numeric|min:0', 'counted_cash' => 'required|numeric|min:0', 'notes' => 'nullable|string']);
        CafeteriaOutlet::findOrFail($d['cafeteria_outlet_id']);
        $sales = (float) CafeteriaOrder::where('cafeteria_outlet_id', $d['cafeteria_outlet_id'])->whereDate('created_at', $d['business_date'])->where('payment_method', 'cash')->whereNotIn('status', ['Voided', 'Cancelled'])->sum('total_amount');
        $refunds = (float) $this->raw('cafeteria_refund_requests')->join('cafeteria_orders', 'cafeteria_orders.id', '=', 'cafeteria_refund_requests.cafeteria_order_id')->where('cafeteria_orders.cafeteria_outlet_id', $d['cafeteria_outlet_id'])->whereDate('cafeteria_refund_requests.decided_at', $d['business_date'])->where('cafeteria_refund_requests.status', 'approved')->where('cafeteria_orders.payment_method', 'cash')->sum('cafeteria_refund_requests.amount');
        $expected = $d['opening_cash'] + $sales - $refunds;
        $this->raw('cafeteria_cash_closings')->updateOrInsert(['campus_id' => config('app.active_campus_id'), 'cafeteria_outlet_id' => $d['cafeteria_outlet_id'], 'business_date' => $d['business_date']], $d + ['cash_sales' => $sales, 'refunds' => $refunds, 'expected_cash' => $expected, 'variance' => $d['counted_cash'] - $expected, 'closed_by' => $r->user()->id, 'closed_at' => now(), 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Daily cash closing completed.');
    }

    public function stock(Request $r, FoodItem $food)
    {
        $d = $r->validate([
            'cafeteria_raw_material_id' => ['nullable', CampusRule::exists('cafeteria_raw_materials')], 
            'stock_quantity' => 'required|numeric|min:0', 
            'reorder_level' => 'required|numeric|min:0', 
            'stock_unit' => 'required|string|max:30'
        ]);
        $food->update($d);

        return back()->with('success', 'Food stock updated.');
    }

    private function findWallet($code, $lock = false)
    {
        $q = CafeteriaWallet::query();
        if ($lock) {
            $q->lockForUpdate();
        }$w = $q->where('card_uid', $code)->first();
        if (! $w) {
            $uid = Student::where('admission_no', $code)->value('user_id') ?? Staff::where('staff_id_no', $code)->value('user_id') ?? User::where('email', $code)->value('id');
            $q = CafeteriaWallet::query();
            if ($lock) {
                $q->lockForUpdate();
            }$w = $q->where('user_id', $uid)->first();
        }if (! $w || ! $w->is_active) {
            throw ValidationException::withMessages(['identifier' => 'No active wallet/card found.']);
        }

        return $w;
    }

    private function txn($w, $type, $amount, $refType, $refId, $user, $method = null, $refNo = null)
    {
        CafeteriaWalletTransaction::create(['campus_id' => $w->campus_id, 'cafeteria_wallet_id' => $w->id, 'type' => $type, 'amount' => $amount, 'balance_after' => $w->fresh()->balance, 'reference_type' => $refType, 'reference_id' => $refId, 'payment_method' => $method, 'reference_no' => $refNo, 'created_by' => $user]);
    }
}