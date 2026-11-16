<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    use BelongsToCampus, HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['attendance_date'=>'date','is_excused'=>'boolean','verified_at'=>'datetime'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
}
