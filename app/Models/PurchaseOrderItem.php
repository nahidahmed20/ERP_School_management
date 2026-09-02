<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $guarded = [];

    protected $casts = ['quantity' => 'integer', 'unit_price' => 'decimal:2', 'subtotal' => 'decimal:2'];

    public function purchaseItem() {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }
}
