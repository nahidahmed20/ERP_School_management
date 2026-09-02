<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentLeaveRequest extends Model { protected $guarded=['id']; protected $casts=['start_date'=>'date','end_date'=>'date']; public function student(){return $this->belongsTo(Student::class);} }
