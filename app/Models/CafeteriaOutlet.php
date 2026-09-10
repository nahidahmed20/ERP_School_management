<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class CafeteriaOutlet extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(FoodItem::class, 'cafeteria_outlet_id');
    }
}
