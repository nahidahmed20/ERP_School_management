<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class VisitLog extends Model
{
    use BelongsToCampus;
    protected $guarded = [];

    protected $casts = [
        'visit_time' => 'datetime',
    ];

    public function patient() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function room() {
        return $this->belongsTo(MedicalRoom::class, 'medical_room_id');
    }
}
