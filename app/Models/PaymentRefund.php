<?php

namespace App\Models;
use App\Traits\BelongsToCampus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRefund extends Model
{
    use BelongsToCampus, HasFactory;

    protected $guarded = ['id'];
    public function transaction()
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
    }
}
