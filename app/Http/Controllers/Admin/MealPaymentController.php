<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealPayment;
use App\Models\User;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MealPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = MealPayment::with('user');

        if ($search = $request->get('search')) {
            $query->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $payments = $query->latest()->paginate(10)->withQueryString();
        $campuses = Campus::select('id', 'name')->get();

        // Spatie & Staff/Student Relation Data 
        $users = User::with(['roles', 'student', 'staff'])->get()->map(function ($user) {
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
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'payment_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        MealPayment::create($validated);

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function update(Request $request, $id)
    {
        $payment = MealPayment::findOrFail($id);

        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'payment_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        $payment->update($validated);

        return back()->with('success', 'Payment updated successfully.');
    }

    public function destroy($id)
    {
        MealPayment::findOrFail($id)->delete();
        return back()->with('success', 'Payment deleted successfully.');
    }
}