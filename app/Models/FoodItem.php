<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    protected $guarded = [];

    public function outlet() {
        return $this->belongsTo(CafeteriaOutlet::class, 'cafeteria_outlet_id');
    }
}