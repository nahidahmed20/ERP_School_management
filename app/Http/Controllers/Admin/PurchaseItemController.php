<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseItem;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PurchaseItemController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseItem::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('name', 'asc');

        $perPage = $request->get('per_page', 10);
        $items = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/PurchaseItems/Index', [
            'items' => $items,
            'campuses' => Campus::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'category', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        PurchaseItem::create($data);
        return back()->with('success', 'নতুন আইটেম যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $item = PurchaseItem::findOrFail($id);
        $data = $this->validateData($request, $item->id);
        $item->update($data);
        return back()->with('success', 'আইটেমের তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        PurchaseItem::findOrFail($id)->delete();
        return back()->with('success', 'আইটেমটি মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? session('active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('purchase_items', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }
}
