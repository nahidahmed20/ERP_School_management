<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpdeskTicket extends Model {
    use HasFactory;

    protected $fillable = [
        'campus_id', 'ticket_number', 'requester_name', 'requester_type',
        'subject', 'description', 'priority', 'status', 'replies'
    ];

    protected $casts = [
        'replies' => 'array', // Automatically cast JSON to Array
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
