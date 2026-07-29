<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $guarded = [];

    public function seller() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items() {
        return $this->hasMany(SaleItem::class, 'sale_id');
    }
}
