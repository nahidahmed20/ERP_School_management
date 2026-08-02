<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasPlan extends Model {
    use HasFactory;

    protected $fillable = [
        'name', 'price', 'currency', 'billing_cycle',
        'features', 'is_active'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];
}
