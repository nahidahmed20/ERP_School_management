<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class TeacherAssignment extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];
    protected $casts = ['is_class_teacher' => 'boolean', 'is_active' => 'boolean'];

    public function staff() { return $this->belongsTo(Staff::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class, 'class_id'); }
    public function section() { return $this->belongsTo(Section::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
}
