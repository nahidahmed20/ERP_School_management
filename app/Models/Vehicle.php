<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'insurance_expires_at'=>'date','fitness_expires_at'=>'date','registration_expires_at'=>'date',
    ];
    protected $hidden=['tracking_token_hash'];
    public function latestLocation(){return $this->hasOne(VehicleLocation::class)->latestOfMany('recorded_at');}
}
