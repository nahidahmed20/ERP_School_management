<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use \App\Traits\BelongsToCampusThrough;

    protected $guarded = [];

    protected $casts = ['quantity' => 'integer', 'unit_price' => 'decimal:2', 'subtotal' => 'decimal:2'];

    public function purchaseOrder() {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function purchaseItem() {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }

    protected function campusOwnershipRelation(): string {
        return 'purchaseOrder';
    }
}
