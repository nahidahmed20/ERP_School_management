<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveType extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    public function staffLeaves()
    {
        return $this->hasMany(StaffLeave::class);
    }
}