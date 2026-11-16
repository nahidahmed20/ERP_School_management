<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Support\CampusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountingVoucherController extends Controller
{
    public function index(Request $request)
    {
        $this->campusId();
        $query = JournalEntry::with(['debitAccount:id,name,code', 'creditAccount:id,name,code', 'creator:id,name'])->whereNull('reversed_at');

        if ($search = $request->get('search')) {
            $query->where(fn ($q) => $q->where('voucher_no', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%"));
        }
        if ($type = $request->get('type')) $query->where('voucher_type', $type);

        return Inertia::render('Admin/Finance/Accounts/Vouchers/Index', [
            'vouchers' => $query->latest('date')->latest('id')->paginate(\App\Support\PerPage::resolve(15))->withQueryString(),
            'accounts' => Account::where('is_active', true)->select('id', 'name', 'code', 'type')->orderBy('code')->get(),
            'filters' => ['search' => $request->get('search', ''), 'type' => $request->get('type', '')],
        ]);
    }

    public function store(Request $request)
    {
        $campusId = $this->campusId();
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'voucher_type' => ['required', Rule::in(['Receipt', 'Payment', 'Contra', 'Journal'])],
            'debit_account_id' => ['required', CampusRule::exists('accounts'), 'different:credit_account_id'],
            'credit_account_id' => ['required', CampusRule::exists('accounts')],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($validated, $campusId) {
            $debit = Account::whereKey($validated['debit_account_id'])->where('is_active', true)->lockForUpdate()->first();
            $credit = Account::whereKey($validated['credit_account_id'])->where('is_active', true)->lockForUpdate()->first();
            abort_unless($debit && $credit, 422, 'Select active accounts from the current campus.');
            $this->validateVoucherAccounts($validated['voucher_type'], $debit, $credit);

            JournalEntry::create($validated + [
                'voucher_no' => 'VCH-'.$campusId.'-'.now()->format('ymdHis').'-'.Str::upper(Str::random(6)),
                'created_by' => auth()->id(),
                'campus_id' => $campusId,
            ]);
        }, 3);

        return back()->with('success', 'Accounting voucher posted successfully.');
    }

    public function destroy(int $id)
    {
        $this->campusId();
        $entry = JournalEntry::findOrFail($id);
        abort_if($entry->source_key, 422, 'System-generated vouchers can only be reversed through their source workflow.');
        abort_if($entry->reversed_at, 422, 'This voucher is already reversed.');
        $entry->update(['reversed_at' => now()]);
        return back()->with('success', 'Voucher reversed successfully.');
    }

    private function validateVoucherAccounts(string $type, Account $debit, Account $credit): void
    {
        $valid = match ($type) {
            'Receipt' => $debit->type === 'Asset' && in_array($credit->type, ['Income', 'Liability', 'Equity'], true),
            'Payment' => in_array($debit->type, ['Expense', 'Liability', 'Equity'], true) && $credit->type === 'Asset',
            'Contra' => $debit->type === 'Asset' && $credit->type === 'Asset',
            default => true,
        };
        abort_unless($valid, 422, "The selected debit and credit accounts are not valid for a {$type} voucher.");
    }

    private function campusId(): int
    {
        $campusId = (int) config('app.active_campus_id');
        abort_if(! $campusId, 422, 'Select a campus before posting a voucher.');
        return $campusId;
    }
}
