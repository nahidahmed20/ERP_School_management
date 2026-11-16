<?php

namespace App\Models;

use App\Traits\BelongsToCampus; 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportRoute extends Model {
    use HasFactory, BelongsToCampus; 

    protected $fillable = [
        'campus_id', 
        'title', 
        'start_point', 
        'end_point', 
        'base_fare', 
        'stops', 
        'is_active'
    ];

    protected $casts = [
        'stops' => 'array',
        'is_active' => 'boolean',
        'base_fare' => 'decimal:2',
    ];
}