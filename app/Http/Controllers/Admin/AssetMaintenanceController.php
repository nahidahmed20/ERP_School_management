<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssetMaintenance;
use App\Models\Asset;
use App\Models\Expense;
use App\Services\AccountingService;
use App\Services\ExpenseAccountingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\CampusRule;

class AssetMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetMaintenance::with('asset');

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('service_provider', 'like', "%{$search}%")
                  ->orWhereHas('asset', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $maintenances = $query->latest('start_date')->paginate(\App\Support\PerPage::resolve())->withQueryString();

        $assets = Asset::select('id', 'name')->get();

        return Inertia::render('Admin/PurchaseAssetMaintenance/Index', [
            'maintenances' => $maintenances,
            'assets' => $assets,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function store(Request $request, ExpenseAccountingService $accounting)
    {
        $data = $request->validate([
            'asset_id' => ['required', CampusRule::exists('assets')],
            'title' => 'required|string|max:255',
            'maintenance_type' => 'required|string|max:255',
            'service_provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:Pending,In Progress,Completed,Cancelled',
            'details' => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $accounting) {
            $maintenance = AssetMaintenance::create($data);
            $this->syncExpense($maintenance, $accounting);
        }, 3);

        return back()->with('success', 'মেইনটেন্যান্স রেকর্ড সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id, ExpenseAccountingService $accounting)
    {
        $maintenance = AssetMaintenance::findOrFail($id);

        $data = $request->validate([
            'asset_id' => ['required', CampusRule::exists('assets')],
            'title' => 'required|string|max:255',
            'maintenance_type' => 'required|string|max:255',
            'service_provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:Pending,In Progress,Completed,Cancelled',
            'details' => 'nullable|string',
        ]);

        DB::transaction(function () use ($maintenance, $data, $accounting) {
            $maintenance->update($data);
            $this->syncExpense($maintenance->fresh(), $accounting);
        }, 3);

        return back()->with('success', 'রেকর্ড আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id, ExpenseAccountingService $accounting)
    {
        $request->validate(['status' => 'required|in:Pending,In Progress,Completed,Cancelled']);

        $maintenance = AssetMaintenance::findOrFail($id);

        $data = ['status' => $request->status];
        if ($request->status === 'Completed' && !$maintenance->end_date) {
            $data['end_date'] = now();
        }

        DB::transaction(function () use ($maintenance, $data, $accounting) {
            $maintenance->update($data);
            $this->syncExpense($maintenance->fresh(), $accounting);
        }, 3);

        return back()->with('success', 'স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id, ExpenseAccountingService $accounting)
    {
        $maintenance = AssetMaintenance::findOrFail($id);
        DB::transaction(function () use ($maintenance, $accounting) {
            if ($maintenance->general_expense_id) {
                $expense = Expense::whereKey($maintenance->general_expense_id)->lockForUpdate()->first();
                if ($expense) {
                    $expense->update(['status' => 'void', 'voided_at' => now()]);
                    $accounting->sync($expense->fresh());
                }
            }
            $maintenance->delete();
        }, 3);
        return back()->with('success', 'রেকর্ড মুছে ফেলা হয়েছে!');
    }

    private function syncExpense(AssetMaintenance $maintenance, ExpenseAccountingService $accounting): void
    {
        $maintenance->loadMissing('asset');
        $expense = $maintenance->general_expense_id ? Expense::whereKey($maintenance->general_expense_id)->first() : null;
        if ($maintenance->status !== 'Completed' || (float) $maintenance->cost <= 0) {
            if ($expense && $expense->status !== 'void') {
                $expense->update(['status' => 'void', 'voided_at' => now()]);
                $accounting->sync($expense->fresh());
            }
            return;
        }
        $campusId = (int) $maintenance->asset->campus_id;
        $expenseAccountId = app(AccountingService::class)->accountForCode('5200', $campusId)->id;
        $data = [
            'campus_id' => $campusId, 'expense_head' => 'Asset maintenance: '.$maintenance->title,
            'amount' => $maintenance->cost, 'expense_date' => \Illuminate\Support\Carbon::parse($maintenance->end_date ?? $maintenance->start_date)->toDateString(),
            'description' => trim(($maintenance->service_provider ? $maintenance->service_provider.' · ' : '').($maintenance->details ?? '')),
            'expense_account_id' => $expenseAccountId, 'status' => 'unpaid', 'voided_at' => null,
        ];
        if (! $expense) {
            $expense = Expense::create($data + ['recorded_by' => (string) auth()->id(), 'created_by' => auth()->id()]);
            $maintenance->update(['general_expense_id' => $expense->id]);
        } else {
            $expense->update($data);
        }
        $accounting->sync($expense->fresh());
    }
}
