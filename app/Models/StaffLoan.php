<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffLoan extends Model {
    use BelongsToCampus, HasFactory;
    
    protected $fillable = [
        'staff_id', 'loan_type', 'amount', 'outstanding_balance', 'monthly_deduction',
        'reason', 'status', 'approved_by', 'settled_at'
    ];

    protected $casts = ['amount' => 'decimal:2', 'outstanding_balance' => 'decimal:2', 'monthly_deduction' => 'decimal:2', 'settled_at' => 'datetime'];

    public function staff() {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
    
    public function approver() {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
