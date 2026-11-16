<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasApiKey extends Model {
    use HasFactory;

    protected $fillable = [
        'name', 'api_key', 'tenant_id', 'last_used_at',
        'expires_at', 'is_active'
    ];


    public function tenant() {
        return $this->belongsTo(SaasTenant::class, 'tenant_id');
    }
}
