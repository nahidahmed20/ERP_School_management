<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['amount' => 'decimal:2', 'transaction_date' => 'date'];
    public function gateway()
    {
        return $this->belongsTo(PaymentGateway::class, 'payment_gateway_id');
    }

    public function refunds()
    {
        return $this->hasMany(PaymentRefund::class);
    }
}
