<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffPayroll extends Model
{
    use BelongsToCampus;

    protected $guarded=['id'];
    protected $casts=[
        'calculation'=>'array', 'generated_at'=>'datetime',
        'basic_salary'=>'decimal:2', 'allowance'=>'decimal:2', 'deduction'=>'decimal:2', 'net_salary'=>'decimal:2',
        'daily_rate'=>'decimal:2', 'absence_deduction'=>'decimal:2', 'loan_deduction'=>'decimal:2',
        'overtime_rate'=>'decimal:2', 'overtime_amount'=>'decimal:2',
        'bonus'=>'decimal:2', 'arrears'=>'decimal:2', 'provident_fund'=>'decimal:2',
        'tax_deduction'=>'decimal:2', 'gratuity_provision'=>'decimal:2',
        'payment_date'=>'date', 'approved_at'=>'datetime', 'finalized_at'=>'datetime', 'payslip_emailed_at'=>'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
