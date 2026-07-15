<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Event extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'classroom_id');
    }
}