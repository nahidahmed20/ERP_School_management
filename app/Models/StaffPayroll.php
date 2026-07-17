<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffPayroll extends Model
{

    protected $guarded=['id'];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
