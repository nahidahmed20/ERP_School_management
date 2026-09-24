<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class VehicleLocation extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['recorded_at' => 'datetime'];
}
