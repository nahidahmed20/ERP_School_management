<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class TransportPersonnel extends Model
{
    use BelongsToCampus;
    protected $table = 'transport_personnel';
    protected $guarded = ['id'];
    protected $casts = ['license_expires_at' => 'date', 'is_active' => 'boolean'];
}