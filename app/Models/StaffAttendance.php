<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffAttendance extends Model
{
    protected $guarded  = ['id'];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
