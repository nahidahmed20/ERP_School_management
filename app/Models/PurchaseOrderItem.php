<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $guarded = [];

    public function purchaseItem() {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }
}
