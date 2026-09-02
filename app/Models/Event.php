<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Event extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'start_datetime' => 'datetime',
            'end_datetime' => 'datetime',
            'is_active' => 'boolean',
            'show_on_dashboard' => 'boolean',
            'is_government_holiday' => 'boolean',
        ];
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'classroom_id');
    }
}
