<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpdeskTicket extends Model {
    use HasFactory, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'user_id', 'ticket_number', 'requester_name', 'requester_type',
        'subject', 'description', 'priority', 'status', 'replies'
    ];

    protected $casts = [
        'replies' => 'array', // Automatically cast JSON to Array
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
