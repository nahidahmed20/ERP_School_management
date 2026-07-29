<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = [
        'size' => 'array',
        'color' => 'array',
        'is_active' => 'boolean',
    ];
}
