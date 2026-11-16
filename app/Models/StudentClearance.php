<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class StudentClearance extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['cleared_at'=>'datetime']; public function student(){return $this->belongsTo(Student::class);} public function transfer(){return $this->belongsTo(StudentTransfer::class,'student_transfer_id');} }
