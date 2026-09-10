<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class CafeteriaWallet extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['balance' => 'decimal:2', 'daily_spending_limit' => 'decimal:2', 'is_active' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(CafeteriaWalletTransaction::class);
    }
}
