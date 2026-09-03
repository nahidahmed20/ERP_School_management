<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class StaffAttendance extends Model
{
    use BelongsToCampus;
    protected $guarded  = ['id'];
    protected $casts = [
        'date' => 'date',
        'salary_paid_override' => 'boolean',
        'overtime_hours' => 'decimal:2',
        'overtime_days' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
