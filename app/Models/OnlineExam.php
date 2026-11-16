<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnlineExam extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['exam_date'=>'date','is_published'=>'boolean','is_active'=>'boolean','total_marks'=>'decimal:2','passing_marks'=>'decimal:2'];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function questions() { return $this->hasMany(ExamQuestion::class); }
}
