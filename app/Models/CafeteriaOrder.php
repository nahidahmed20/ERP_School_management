<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CafeteriaOrder extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'items' => 'array', 
    ];

    public function customer() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function outlet() {
        return $this->belongsTo(CafeteriaOutlet::class, 'cafeteria_outlet_id');
    }
}