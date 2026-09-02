<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Exam extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date', 'end_date' => 'date', 'is_active' => 'boolean',
        'results_published' => 'boolean', 'results_published_at' => 'datetime',
    ];

    public function schedules()
    {
        return $this->hasMany(ExamSchedule::class, 'exam_id');
    }
}
