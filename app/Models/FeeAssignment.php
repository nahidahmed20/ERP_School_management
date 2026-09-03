<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeAssignment extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2', 'starts_on' => 'date', 'ends_on' => 'date',
            'next_invoice_date' => 'date', 'discount_value' => 'decimal:2',
            'late_fee_value' => 'decimal:2', 'is_active' => 'boolean',
        ];
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function feeGroup()
    {
        return $this->belongsTo(FeeGroup::class, 'fee_group_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'fee_assignment_id');
    }
}
