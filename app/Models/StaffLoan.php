<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffLoan extends Model {
    use BelongsToCampus, HasFactory;
    
    protected $fillable = [
        'staff_id', 'loan_type', 'amount', 'monthly_deduction', 
        'reason', 'status', 'approved_by'
    ];

    public function staff() {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
    
    public function approver() {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
