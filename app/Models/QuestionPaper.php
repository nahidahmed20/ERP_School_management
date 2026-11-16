<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class QuestionPaper extends Model
{
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = ['exam_date'=>'date','questions'=>'array','full_marks'=>'decimal:2'];
    public function schoolClass() { return $this->belongsTo(SchoolClass::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
