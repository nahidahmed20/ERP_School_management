<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $guarded = [];

    protected $casts = [
        'subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2', 'due_amount' => 'decimal:2',
    ];

    public function seller() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items() {
        return $this->hasMany(SaleItem::class, 'sale_id');
    }
}
