<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricDevice extends Model {
    use HasFactory, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'name', 'ip_address', 'port',
        'serial_number', 'status', 'last_sync', 'api_token_hash', 'sync_mode', 'sync_interval', 'last_error'
    ];
    protected $hidden = ['api_token_hash'];
    protected $casts = ['last_sync' => 'datetime'];

    public function campus() { return $this->belongsTo(Campus::class); }
}
