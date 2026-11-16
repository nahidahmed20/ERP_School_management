<?php

namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = ['marks_obtained'=>'decimal:2','grade_point'=>'decimal:2','written_marks'=>'decimal:2','practical_marks'=>'decimal:2','viva_marks'=>'decimal:2','full_marks'=>'decimal:2','pass_marks'=>'decimal:2'];

    public function student() {
        return $this->belongsTo(Student::class);
    }
    public function subject() {
        return $this->belongsTo(Subject::class);
    }

    public function exam() {
        return $this->belongsTo(Exam::class);
    }

    public function schoolClass() {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }
}
