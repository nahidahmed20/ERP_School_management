<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class HomeworkSubmission extends Model { protected $guarded=['id']; protected $casts=['submitted_at'=>'datetime','evaluated_at'=>'datetime','marks_obtained'=>'decimal:2']; public function homework(){return $this->belongsTo(Homework::class);} public function student(){return $this->belongsTo(Student::class);} }
