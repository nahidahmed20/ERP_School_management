<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationNotification extends Model {
    use HasFactory;

    protected $fillable = [
        'campus_id', 'title', 'message', 'notification_type',
        'target_audience', 'status'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
