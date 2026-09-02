<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AttendanceCorrectionRequest extends Model { protected $guarded=['id']; protected $casts=['attendance_date'=>'date']; public function student(){return $this->belongsTo(Student::class);} }
