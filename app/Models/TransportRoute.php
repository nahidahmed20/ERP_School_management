<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportRoute extends Model {
    use HasFactory;

    protected $fillable = [
        'title', 'start_point', 'end_point', 'base_fare', 'stops', 'is_active'
    ];

    protected $casts = [
        'stops' => 'array',
        'is_active' => 'boolean',
    ];
}
