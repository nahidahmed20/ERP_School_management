<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OnlineExamAnswer extends Model { protected $guarded=['id']; protected $casts=['is_correct'=>'boolean','awarded_marks'=>'decimal:2']; public function question(){return $this->belongsTo(QuestionBank::class,'question_bank_id');} }
