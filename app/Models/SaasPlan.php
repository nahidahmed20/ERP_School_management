<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasPlan extends Model {
    use HasFactory;

    protected $fillable = [
        'name', 'price', 'currency', 'billing_cycle',
        'features', 'is_active'
        ,'feature_limits','max_campuses','max_students','storage_limit_mb'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'feature_limits'=>'array',
    ];
}
