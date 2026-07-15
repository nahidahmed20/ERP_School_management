<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Exam extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    public function schedules()
    {
        return $this->hasMany(ExamSchedule::class, 'exam_id');
    }
}
