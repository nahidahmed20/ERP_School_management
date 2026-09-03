<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CafeteriaOrder extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'items' => 'array', 'accepted_at'=>'datetime','preparing_at'=>'datetime','ready_at'=>'datetime','served_at'=>'datetime',
    ];

    public function customer() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function outlet() {
        return $this->belongsTo(CafeteriaOutlet::class, 'cafeteria_outlet_id');
    }
}
