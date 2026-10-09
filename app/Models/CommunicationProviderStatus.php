<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunicationProviderStatus extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'balance' => 'decimal:4',
        'checked_at' => 'datetime'
    ];
}

