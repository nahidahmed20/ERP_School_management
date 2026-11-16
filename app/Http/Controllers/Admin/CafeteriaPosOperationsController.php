<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{CafeteriaRefundRequest, CafeteriaCashClosing, CafeteriaOrder, CafeteriaOutlet};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CafeteriaPosOperationsController extends Controller
{
    private function campusExists(string $table)
    {
        return Rule::exists($table, 'id')->where(fn($q) => $q->where('campus_id', config('app.active_campus_id')));
    }

    public function index()
    {
        $campusId = config('app.active_campus_id');

        return Inertia::render('Admin/CafeteriaPos/Index', [
            'outlets' => CafeteriaOutlet::where('campus_id', $campusId)->get(),
            'orders' => CafeteriaOrder::where('campus_id', $campusId)->latest()->take(50)->get(),
            'refundRequests' => CafeteriaRefundRequest::where('campus_id', $campusId)->with('order.customer')->latest()->take(50)->get(),
            'cashClosings' => CafeteriaCashClosing::where('campus_id', $campusId)->with('outlet')->latest('closed_at')->take(50)->get(),
        ]);
    }

    public function requestRefund(Request $r)
    {
        $d = $r->validate([
            'cafeteria_order_id' => ['required', $this->campusExists('cafeteria_orders')],
            'type' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string'
        ]);

        $d['campus_id'] = config('app.active_campus_id');
        $d['requested_by'] = $r->user()->id;
        $d['status'] = 'pending';

        CafeteriaRefundRequest::create($d);

        return back()->with('success', 'Refund request submitted.');
    }

    public function closeCash(Request $r)
    {
        $d = $r->validate([
            'cafeteria_outlet_id' => ['required', $this->campusExists('cafeteria_outlets')],
            'business_date' => 'required|date',
            'opening_cash' => 'required|numeric|min:0',
            'cash_sales' => 'required|numeric|min:0',
            'refunds' => 'required|numeric|min:0',
            'expected_cash' => 'required|numeric|min:0',
            'counted_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $d['campus_id'] = config('app.active_campus_id');
        $d['variance'] = $d['counted_cash'] - $d['expected_cash'];
        $d['closed_by'] = $r->user()->id;
        $d['closed_at'] = now();

        CafeteriaCashClosing::create($d);

        return back()->with('success', 'Cash closing completed successfully.');
    }
}

