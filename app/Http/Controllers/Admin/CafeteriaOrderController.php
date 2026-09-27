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
        $activeCampusId = config('app.active_campus_id');

        $query = CafeteriaOrder::with(['customer', 'outlet'])
            ->where('campus_id', $activeCampusId);

        if ($search = $request->get('search')) {
            $query->where('order_number', 'like', "%{$search}%");
        }
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($paymentStatus = $request->get('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        $orders = $query->latest()->paginate(PerPage::resolve())->withQueryString();

        $outlets = CafeteriaOutlet::where('campus_id', $activeCampusId)->where('is_active', true)->select('id', 'name')->get();

        // 🟢 FIX: cafeteria_outlet_id যোগ করা হলো, যাতে ফ্রন্টএন্ডে ফিল্টার করা যায়
        $foods = FoodItem::whereHas('outlet', function($q) use ($activeCampusId) {
                $q->where('campus_id', $activeCampusId);
            })
            ->where('is_available', true)
            ->select('id', 'name', 'price', 'cafeteria_outlet_id')->get();

        $campuses = Campus::select('id', 'name')->get();

        $users = User::where('campus_id', $activeCampusId)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['Student', 'Teacher', 'Staff', 'student', 'teacher', 'staff']);
            })
            ->with(['roles', 'student.schoolClass', 'staff'])
            ->get()
            ->map(function ($user) {
                $roleName = $user->roles->first()->name ?? 'User';
                $displayName = $user->name;

                if ($user->student) {
                    $className = $user->student->schoolClass ? ' - Class: ' . $user->student->schoolClass->name : '';
                    $displayName = trim($user->student->first_name.' '.$user->student->last_name).' ('.$user->student->admission_no.')' . $className;
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
            'activeCampusId' => $activeCampusId,
            'filters' => $request->only(['search', 'status', 'payment_status']),
        ]);
    }

    public function store(Request $request)
    {
        // 🟢 FIX: Items সহ সম্পূর্ণ ভ্যালিডেশন
        $validated = $request->validate([
            'user_id' => ['required', CampusRule::exists('users')],
            'cafeteria_outlet_id' => ['required', CampusRule::exists('cafeteria_outlets')],
            'status' => 'required|string',
            'payment_status' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.food_item_id' => 'required|exists:food_items,id',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        // অটোমেটিক টোটাল প্রাইস হিসাব করা
        $totalAmount = collect($validated['items'])->sum(function ($item) {
            return $item['price'] * $item['qty'];
        });

        CafeteriaOrder::create([
            'campus_id' => config('app.active_campus_id'),
            'user_id' => $validated['user_id'],
            'cafeteria_outlet_id' => $validated['cafeteria_outlet_id'],
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'total_amount' => $totalAmount,
            'status' => $validated['status'],
            'payment_status' => $validated['payment_status'],
            'items' => $validated['items'], // JSON হিসেবে সেভ হবে
            'source' => 'manual',
            'processed_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Manual order created successfully.');
    }

    public function update(Request $request, $id)
    {
        $order = CafeteriaOrder::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string',
            'payment_status' => 'required|string',
        ]);
        $order->update($validated);
        return back()->with('success', 'Order status updated successfully.');
    }

    public function destroy($id)
    {
        CafeteriaOrder::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->delete();
        return back()->with('success', 'Order permanently deleted.');
    }
}