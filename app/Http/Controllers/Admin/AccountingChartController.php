<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountingChartController extends Controller
{
    public function index(Request $request)
    {
        $this->campusId();
        $query = Account::query();

        if ($search = $request->input('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"));
        }
        if ($type = $request->input('type')) $query->where('type', $type);

        $perPage = $request->input('per_page', 10);
        $totalCount = $query->count();
        $perPageCount = $perPage === 'all' ? max(1, $totalCount) : max(1, min(100, (int) $perPage));

        return Inertia::render('Admin/Finance/Accounts/Chart/Index', [
            'accounts' => $query->orderBy('type')->orderBy('code')->paginate($perPageCount)->withQueryString(),
            'filters' => ['search' => $request->input('search', ''), 'type' => $request->input('type', ''), 'per_page' => $perPage],
        ]);
    }

    public function store(Request $request)
    {
        $campusId = $this->campusId();
        $validated = $this->validated($request, $campusId);

        DB::transaction(function () use ($validated, $campusId) {
            // Serialise code generation for the selected campus, so concurrent
            // requests cannot receive the same automatic code.
            DB::table('campuses')->where('id', $campusId)->lockForUpdate()->firstOrFail();
            $validated['code'] = $validated['code'] ?: $this->generateAccountCode($validated['type'], $campusId);
            Account::create($validated + ['campus_id' => $campusId]);
        });

        return back()->with('success', 'Account created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $campusId = $this->campusId();
        $account = Account::findOrFail($id);
        $validated = $this->validated($request, $campusId, $account);
        $validated['code'] = $validated['code'] ?: $account->code;

        $hasEntries = JournalEntry::withoutGlobalScopes()
            ->where(fn ($q) => $q->where('debit_account_id', $account->id)->orWhere('credit_account_id', $account->id))
            ->exists();
        abort_if($hasEntries && (
            $validated['code'] !== $account->code ||
            $validated['type'] !== $account->type ||
            round((float) $validated['opening_balance'], 2) !== round((float) $account->opening_balance, 2)
        ), 422, 'Accounts with posted transactions cannot have their code, type, or opening balance changed.');

        $account->update($validated);
        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->campusId();
        $account = Account::findOrFail($id);
        $hasEntries = JournalEntry::withoutGlobalScopes()
            ->where(fn ($q) => $q->where('debit_account_id', $account->id)->orWhere('credit_account_id', $account->id))
            ->exists();
        abort_if($hasEntries, 422, 'This account has posted transactions. Set it inactive instead of deleting it.');
        $account->delete();
        return back()->with('success', 'Account deleted successfully.');
    }

    private function validated(Request $request, int $campusId, ?Account $account = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('accounts', 'code')->where('campus_id', $campusId)->ignore($account?->id)],
            'type' => ['required', Rule::in(['Asset', 'Liability', 'Equity', 'Income', 'Expense'])],
            'opening_balance' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function generateAccountCode(string $type, int $campusId): string
    {
        $prefix = ['Asset' => '1', 'Liability' => '2', 'Equity' => '3', 'Income' => '4', 'Expense' => '5'][$type] ?? '9';
        $last = Account::withoutGlobalScopes()->where('campus_id', $campusId)->where('type', $type)
            ->pluck('code')->filter(fn ($code) => preg_match('/^'.$prefix.'\d+$/', (string) $code))
            ->map(fn ($code) => (int) $code)->max();

        return (string) (($last ?: ((int) $prefix * 1000)) + 1);
    }

    private function campusId(): int
    {
        $campusId = (int) config('app.active_campus_id');
        abort_if(! $campusId, 422, 'Select a campus before managing accounts.');
        return $campusId;
    }
}