<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use \App\Traits\BelongsToCampusThrough;

    protected $guarded = [];

    protected $casts = ['quantity' => 'integer', 'unit_price' => 'decimal:2', 'unit_cost' => 'decimal:2', 'subtotal' => 'decimal:2'];

    public function sale() {
        return $this->belongsTo(Sale::class);
    }

    public function product() {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }

    protected function campusOwnershipRelation(): string {
        return 'sale';
    }
}
