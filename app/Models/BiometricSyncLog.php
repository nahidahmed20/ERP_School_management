<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricSyncLog extends Model {
    use HasFactory;
    
    protected $fillable = [
        'campus_id', 'device_id', 'enrolled_user_id', 'biometric_id', 
        'punch_time', 'punch_state', 'sync_status', 'error_message', 'raw_data'
    ];

    protected $casts = [
        'punch_time' => 'datetime',
        'raw_data' => 'array',
    ];
    
    // Relations to get Device name and User Name
    public function device() { return $this->belongsTo(BiometricDevice::class, 'device_id'); }
    public function enrolledUser() { return $this->belongsTo(BiometricEnrolledUser::class, 'enrolled_user_id'); }
    public function campus() { return $this->belongsTo(Campus::class); }
}