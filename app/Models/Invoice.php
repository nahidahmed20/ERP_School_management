<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['invoice_date' => 'date', 'due_date' => 'date', 'period_start' => 'date', 'period_end' => 'date', 'fine_applied_at' => 'datetime'];
    }

    public function feeAssignment()
    {
        return $this->belongsTo(FeeAssignment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function feeGroup()
    {
        return $this->belongsTo(FeeGroup::class);
    }

    public function paymentAllocations()
    {
        return $this->hasMany(PaymentAllocation::class);
    }
}
