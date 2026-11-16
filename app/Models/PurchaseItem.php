<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = [
        'size' => 'array',
        'color' => 'array',
        'is_active' => 'boolean',
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
