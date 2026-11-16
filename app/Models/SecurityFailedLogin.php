<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityFailedLogin extends Model {
    use HasFactory;
    
    protected $fillable = [
        'email_attempted', 'ip_address', 'user_agent', 'attempted_at'
    ];

    protected $casts = [
        'attempted_at' => 'datetime',
    ];
}