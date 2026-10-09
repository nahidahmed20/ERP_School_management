<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class CafeteriaRefundRequest extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['decided_at' => 'datetime'];

    public function order()
    {
        return $this->belongsTo(CafeteriaOrder::class, 'cafeteria_order_id');
    }
}
