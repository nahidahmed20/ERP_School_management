<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelFee extends Model {
    use HasFactory;
    
    protected $fillable = [
        'student_id', 'hostel_room_id', 'amount', 'month', 
        'year', 'payment_date', 'status', 'remarks'
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function student() {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function room() {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }
}