<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class MedicineStock extends Model
{
    use BelongsToCampus;
    protected $guarded = [];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function room() {
        return $this->belongsTo(MedicalRoom::class, 'medical_room_id');
    }
}
