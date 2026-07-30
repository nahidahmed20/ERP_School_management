<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CafeteriaOutlet extends Model
{
    protected $guarded = [];

    public function items() {
        return $this->hasMany(FoodItem::class, 'cafeteria_outlet_id');
    }
}