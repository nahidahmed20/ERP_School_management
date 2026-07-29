<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $guarded = [];

    public function product() {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }
}
