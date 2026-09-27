<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaWallet;
use App\Models\CafeteriaWalletTransaction;
use App\Models\User;
use App\Models\Campus;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MealPaymentController extends Controller
{
    public function index(Request $request)
    {
        $activeCampusId = config('app.active_campus_id');

        $query = CafeteriaWalletTransaction::with(['wallet.user'])
            ->where('campus_id', $activeCampusId)
            ->where('type', 'topup');

        if ($search = $request->get('search')) {
            $query->where('reference_no', 'like', "%{$search}%")
                  ->orWhereHas('wallet.user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $payments = $query->latest()->paginate(PerPage::resolve())->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        $today = today();
        $summary = [
            'today_count' => CafeteriaWalletTransaction::where('campus_id', $activeCampusId)->where('type', 'topup')->whereDate('created_at', $today)->count(),
            'today_amount' => CafeteriaWalletTransaction::where('campus_id', $activeCampusId)->where('type', 'topup')->whereDate('created_at', $today)->sum('amount'),
            'total_amount' => CafeteriaWalletTransaction::where('campus_id', $activeCampusId)->where('type', 'topup')->sum('amount'),
        ];

        $users = User::where('campus_id', $activeCampusId)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['Student', 'Teacher', 'Staff', 'student', 'teacher', 'staff']);
            })
            ->with(['roles', 'student', 'staff'])->get()->map(function ($user) {
                $roleName = $user->roles->first()->name ?? 'User';
                $displayName = $user->name;
                if ($user->student) {
                    $displayName = trim($user->student->first_name . ' ' . $user->student->last_name) . ' (' . $user->student->admission_no . ')';
                    $roleName = 'Student';
                } elseif ($user->staff) {
                    $displayName = trim($user->staff->first_name . ' ' . $user->staff->last_name) . ' (' . $user->staff->staff_id_no . ')';
                }
                return ['id' => $user->id, 'name' => $displayName, 'role' => ucfirst($roleName)];
            });

        return Inertia::render('Admin/CafeteriaMealPayments/Index', [
            'payments' => $payments,
            'users' => $users,
            'campuses' => $campuses,
            'summary' => $summary, 
            'activeCampusId' => $activeCampusId,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $wallet = CafeteriaWallet::firstOrCreate(
                ['user_id' => $validated['user_id']],
                ['campus_id' => config('app.active_campus_id'), 'balance' => 0]
            );

            $wallet->increment('balance', $validated['amount']);

            CafeteriaWalletTransaction::create([
                'campus_id' => config('app.active_campus_id'),
                'cafeteria_wallet_id' => $wallet->id,
                'type' => 'topup',
                'amount' => $validated['amount'],
                'balance_after' => $wallet->fresh()->balance,
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['transaction_id'],
                'notes' => $validated['remarks'],
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Payment recorded & wallet balance updated successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $id) {
            $transaction = CafeteriaWalletTransaction::with('wallet')->findOrFail($id);
            $difference = $validated['amount'] - $transaction->amount;
            $transaction->wallet->increment('balance', $difference);

            $transaction->update([
                'amount' => $validated['amount'],
                'balance_after' => $transaction->wallet->fresh()->balance,
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['transaction_id'],
                'notes' => $validated['remarks'],
            ]);
        });

        return back()->with('success', 'Payment and wallet balance updated successfully.');
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            $transaction = CafeteriaWalletTransaction::with('wallet')->findOrFail($id);
            $transaction->wallet->decrement('balance', $transaction->amount);
            $transaction->delete();
        });

        return back()->with('success', 'Payment deleted and wallet balance reversed.');
    }
}