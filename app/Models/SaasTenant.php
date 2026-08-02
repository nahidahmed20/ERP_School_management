<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasTenant extends Model {
    use HasFactory;

    protected $fillable = [
        'company_name', 'domain', 'admin_email', 'admin_phone',
        'subscription_plan', 'status', 'valid_until'
    ];

    protected $casts = [
        'valid_until' => 'date',
    ];
}
