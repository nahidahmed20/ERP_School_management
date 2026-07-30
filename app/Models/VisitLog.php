<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class VisitLog extends Model
{
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