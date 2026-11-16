<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class HomeworkSubmission extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['submitted_at'=>'datetime','evaluated_at'=>'datetime','marks_obtained'=>'decimal:2']; public function homework(){return $this->belongsTo(Homework::class);} public function student(){return $this->belongsTo(Student::class);} }
