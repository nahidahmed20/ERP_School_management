<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MedicineStock extends Model
{
    protected $guarded = [];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function room() {
        return $this->belongsTo(MedicalRoom::class, 'medical_room_id');
    }
}