<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class CafeteriaCashClosing extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['business_date' => 'date', 'closed_at' => 'datetime'];

    public function outlet()
    {
        return $this->belongsTo(CafeteriaOutlet::class, 'cafeteria_outlet_id');
    }
}
