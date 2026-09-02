<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\PurchaseItem;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function move(PurchaseItem $item, int $change, string $type, object $reference, ?string $note = null): InventoryMovement
    {
        $item = PurchaseItem::query()->lockForUpdate()->findOrFail($item->id);
        $before = (int) $item->quantity;
        $after = $before + $change;

        if ($after < 0) {
            throw ValidationException::withMessages([
                'cart' => "{$item->name}-এর পর্যাপ্ত stock নেই। Available: {$before}",
            ]);
        }

        $item->update(['quantity' => $after]);

        return InventoryMovement::create([
            'campus_id' => $item->campus_id,
            'purchase_item_id' => $item->id,
            'movement_type' => $type,
            'quantity_change' => $change,
            'quantity_before' => $before,
            'quantity_after' => $after,
            'unit_cost' => $item->purchase_price,
            'reference_type' => $reference::class,
            'reference_id' => $reference->id,
            'note' => $note,
            'created_by' => auth()->id(),
        ]);
    }
}
