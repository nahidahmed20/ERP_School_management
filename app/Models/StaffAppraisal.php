<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffAppraisal extends Model {
    use HasFactory;
    
    protected $fillable = [
        'staff_id', 'appraisal_date', 'period', 'rating', 'remarks', 'evaluated_by'
    ];

    protected $casts = [
        'appraisal_date' => 'date',
    ];

    public function staff() {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
    
    public function evaluator() {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
