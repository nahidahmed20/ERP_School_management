<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['attendance_date'=>'date','is_excused'=>'boolean','verified_at'=>'datetime'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
}
