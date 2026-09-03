<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use SoftDeletes;

    protected $table = 'staff';

    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function attendances()
    {
        return $this->hasMany(StaffAttendance::class);
    }

    public function leaves()
    {
        return $this->hasMany(StaffLeave::class);
    }

    public function payrolls()
    {
        return $this->hasMany(StaffPayroll::class);
    }

    public function hrRecords()
    {
        return $this->hasMany(StaffHrRecord::class);
    }
}
