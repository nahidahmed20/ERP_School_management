<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model {
    use HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['sent_at' => 'datetime'];

    public function campus() { return $this->belongsTo(Campus::class); }
}
