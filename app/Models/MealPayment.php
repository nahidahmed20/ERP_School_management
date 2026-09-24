<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class MealPayment extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
