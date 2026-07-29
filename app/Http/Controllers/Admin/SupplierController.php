<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($search = $request->search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
        }

        $suppliers = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/PurchaseSuppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        Supplier::create($request->all());

        return back()->with('success', 'সাপ্লায়ার সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $supplier->update($request->all());

        return back()->with('success', 'সাপ্লায়ার আপডেট করা হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['is_active' => 'required|boolean']);

        $supplier = Supplier::findOrFail($id);
        $supplier->update(['is_active' => $request->is_active]);

        return back()->with('success', 'সাপ্লায়ারের স্ট্যাটাস আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        Supplier::findOrFail($id)->delete();
        return back()->with('success', 'সাপ্লায়ার মুছে ফেলা হয়েছে!');
    }
}
