<?php

namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use BelongsToCampus, HasFactory;

    protected $guarded = []; 

    public function feeAssignment()
    {
        return $this->belongsTo(FeeAssignment::class, 'fee_assignment_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
    public function invoice(){return $this->belongsTo(Invoice::class);}
    public function allocations(){return $this->hasMany(PaymentAllocation::class);}
}
