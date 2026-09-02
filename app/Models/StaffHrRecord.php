<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class StaffHrRecord extends Model
{
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = ['record_date' => 'date', 'details' => 'array', 'employee_amount' => 'decimal:2', 'employer_amount' => 'decimal:2', 'rating' => 'decimal:2'];
    public function staff() { return $this->belongsTo(Staff::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
