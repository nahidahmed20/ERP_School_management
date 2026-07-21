<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeAssignment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function feeGroup()
    {
        return $this->belongsTo(FeeGroup::class, 'fee_group_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'fee_assignment_id');
    }
}
