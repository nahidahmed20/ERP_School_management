<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    protected $guarded = [];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'academic_session_id');
    }
}