<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model {
    use BelongsToCampus, HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['sent_at' => 'datetime'];

    public function campus() { return $this->belongsTo(Campus::class); }
}
