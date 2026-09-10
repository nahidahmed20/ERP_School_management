<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaOrder;
use App\Models\CafeteriaOutlet;
use App\Models\Campus;
use App\Models\FoodItem;
use App\Models\User;
use App\Support\CampusRule;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CafeteriaOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = CafeteriaOrder::with(['customer', 'outlet']);

        if ($search = $request->get('search')) {
            $query->where('order_number', 'like', "%{$search}%");
        }

        $orders = $query->latest()->paginate(PerPage::resolve())->withQueryString();

        $outlets = CafeteriaOutlet::where('is_active', true)->select('id', 'name')->get();
        $foods = FoodItem::where('is_available', true)->select('id', 'name', 'price')->get();
        $campuses = Campus::select('id', 'name')->get();

        // Spatie & Staff/Student Relation Data
        $users = User::with(['roles', 'student', 'staff'])->get()->map(function ($user) {
            $roleName = $user->roles->first()->name ?? 'User';
            $displayName = $user->name;
            if ($user->student) {
                $displayName = trim($user->student->first_name.' '.$user->student->last_name).' ('.$user->student->admission_no.')';
                $roleName = 'Student';
            } elseif ($user->staff) {
                $displayName = trim($user->staff->first_name.' '.$user->staff->last_name).' ('.$user->staff->staff_id_no.')';
            }

            return ['id' => $user->id, 'name' => $displayName, 'role' => ucfirst($roleName)];
        });

        return Inertia::render('Admin/CafeteriaOrders/Index', [
            'orders' => $orders,
            'outlets' => $outlets,
            'users' => $users,
            'foods' => $foods,
            'campuses' => $campuses,
            'activeCampusId' => session('active_campus_id'),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        return back()->with('error', 'Direct cafeteria orders are disabled. Use Cafeteria & Wallet POS so stock, payment and accounting stay synchronized.');
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'user_id' => ['required', CampusRule::exists('users')],
            'cafeteria_outlet_id' => ['required', CampusRule::exists('cafeteria_outlets')],
            'total_amount' => 'required|numeric',
            'status' => 'required|string',
            'payment_status' => 'required|string',
            'items' => 'required|array',
        ]);

        $validated['order_number'] = 'ORD-'.strtoupper(uniqid());
        CafeteriaOrder::create($validated);

        return back()->with('success', 'Order placed successfully.');
    }

    public function update(Request $request, $id)
    {
        return back()->with('error', 'Use the kitchen workflow to update cafeteria orders.');
        $order = CafeteriaOrder::findOrFail($id);

        // Inline Status Update or Full Update
        $validated = $request->validate([
            'status' => 'required|string',
            'payment_status' => 'required|string',
        ]);

        $order->update($validated);

        return back()->with('success', 'Order updated successfully.');
    }

    public function destroy($id)
    {
        return back()->with('error', 'Direct deletion is disabled. Submit a refund/void request from Cafeteria & Wallet POS.');
    }
}
