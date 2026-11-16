<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = [
        'quantity_change' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'unit_cost' => 'decimal:2',
    ];

    public function item()
    {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }
}
