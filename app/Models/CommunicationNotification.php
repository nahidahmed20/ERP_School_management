<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationNotification extends Model {
    use HasFactory, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'title', 'message', 'notification_type',
        'target_audience', 'status'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
