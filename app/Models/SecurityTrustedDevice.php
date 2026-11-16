<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampusThrough;

class SecurityTrustedDevice extends Model {
    use HasFactory, BelongsToCampusThrough;
    
    protected $fillable = [
        'user_id', 'device_name', 'device_identifier', 
        'last_ip_address', 'browser_agent', 'last_used_at'
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];
    
    protected function campusOwnershipRelation(): string
    {
        return 'user';
    }

    public function user() { 
        return $this->belongsTo(User::class); 
    }
}