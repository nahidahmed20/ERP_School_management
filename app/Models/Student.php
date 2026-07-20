<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class, 'guardian_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function currentEnrollment()
    {
        return $this->hasOne(Enrollment::class, 'student_id')->where('is_current', true);
    }

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }

    public function feeAssignments()
    {
        return $this->hasMany(FeeAssignment::class, 'student_id');
    }

}
