<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseItem;
use App\Models\ItemSize;
use App\Models\ItemColor;
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
                  ->orWhere('item_code', 'like', "%{$search}%");
        }

        $query->orderBy('name', 'asc');

        $perPage = $request->get('per_page', 10);
        $items = $perPage === 'all'
            ? ['data' => $query->get(), 'links' => [], 'meta' => ['total' => $query->count()]]
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/PurchaseItems/Index', [
            'items' => $items,
            'campuses' => Campus::select('id', 'name')->get(),
            'sizes' => ItemSize::orderBy('name')->get(),
            'colors' => ItemColor::orderBy('name')->get(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if (empty($data['item_code'])) {
            $data['item_code'] = 'PRD-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4));
        }

        PurchaseItem::create($data);
        return back()->with('success', 'নতুন আইটেম যোগ করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $item = PurchaseItem::findOrFail($id);
        $data = $this->validateData($request, $item->id);

        if (empty($data['item_code'])) {
            $data['item_code'] = 'PRD-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4));
        }

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
            'item_code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('purchase_items', 'item_code')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('purchase_items', 'name')->where('campus_id', $campusId)->ignore($ignoreId)
            ],
            'category' => 'required|string|max:100',
            'size' => 'nullable|array',
            'color' => 'nullable|array',  
            'unit' => 'required|string|max:50',
            'quantity' => 'required|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
    }

    public function storeSize(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:item_sizes,name']);
        ItemSize::create(['name' => $request->name]);
        return back()->with('success', 'Size যুক্ত করা হয়েছে।');
    }

    public function destroySize($id)
    {
        ItemSize::findOrFail($id)->delete();
        return back()->with('success', 'Size মুছে ফেলা হয়েছে।');
    }

    public function storeColor(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:item_colors,name']);
        ItemColor::create(['name' => $request->name]);
        return back()->with('success', 'Color যুক্ত করা হয়েছে।');
    }

    public function destroyColor($id)
    {
        ItemColor::findOrFail($id)->delete();
        return back()->with('success', 'Color মুছে ফেলা হয়েছে।');
    }
}
