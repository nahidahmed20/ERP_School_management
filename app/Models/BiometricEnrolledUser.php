<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricEnrolledUser extends Model {
    use HasFactory;

    protected $fillable = [
        'campus_id', 'user_type', 'user_id', 'user_name',
        'biometric_id', 'rfid_card_no', 'is_active'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
