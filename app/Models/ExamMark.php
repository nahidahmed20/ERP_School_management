<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model {
    protected $guarded = ['id'];

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
