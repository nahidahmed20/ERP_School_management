<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    use BelongsToCampus;
    protected $guarded = [];
    protected $casts = ['phone_verified_at'=>'datetime','notification_preferences'=>'array'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'guardian_id');
    }

    public function linkedStudents()
    {
        return $this->belongsToMany(Student::class, 'student_guardians')->withPivot(['relationship','is_primary','can_pickup','receives_sms','receives_email','custody_note'])->withTimestamps();
    }
}
