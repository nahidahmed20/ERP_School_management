<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class StudentLeaveRequest extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['start_date'=>'date','end_date'=>'date']; public function student(){return $this->belongsTo(Student::class);} }
