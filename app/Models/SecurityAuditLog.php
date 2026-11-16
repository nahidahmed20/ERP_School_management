<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampusThrough;

class SecurityAuditLog extends Model {
    use HasFactory, BelongsToCampusThrough;

    protected $fillable = [
        'user_id', 'action', 'model_type', 'model_id',
        'old_values', 'new_values', 'ip_address', 'user_agent'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    protected function campusOwnershipRelation(): string
    {
        return 'user';
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
