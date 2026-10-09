<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampusThrough;

class SecurityLoginHistory extends Model {
    use HasFactory, BelongsToCampusThrough;
    
    protected $fillable = [
        'user_id', 'ip_address', 'user_agent', 'device_type', 'login_at'
    ];

    protected $casts = [
        'login_at' => 'datetime',
    ];
    
    protected function campusOwnershipRelation(): string
    {
        return 'user';
    }

    public function user() { 
        return $this->belongsTo(User::class); 
    }
}
