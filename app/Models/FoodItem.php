<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    protected $casts = ['is_available' => 'boolean', 'price' => 'decimal:2', 'stock_quantity' => 'decimal:2', 'reorder_level' => 'decimal:2'];

    public function outlet()
    {
        return $this->belongsTo(CafeteriaOutlet::class, 'cafeteria_outlet_id');
    }
}
