<?php
namespace App\Models;
use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class AttendanceCorrectionRequest extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['attendance_date'=>'date'];public function student(){return $this->belongsTo(Student::class);}}
