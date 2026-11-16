<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class StudentDevelopmentRecord extends Model
{
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = ['record_date'=>'date','follow_up_date'=>'date','amount'=>'decimal:2','score'=>'decimal:2','details'=>'array'];
    public function student() { return $this->belongsTo(Student::class); }
    public function recorder() { return $this->belongsTo(User::class, 'recorded_by'); }
}
