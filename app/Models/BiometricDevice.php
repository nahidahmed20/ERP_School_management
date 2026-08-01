<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricDevice extends Model {
    use HasFactory;

    protected $fillable = [
        'campus_id', 'name', 'ip_address', 'port',
        'serial_number', 'status', 'last_sync'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
