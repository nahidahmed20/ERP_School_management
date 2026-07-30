<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TranscriptTemplate extends Model {
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campus_id', 'title', 'grading_system', 'header_text', 'footer_text',
        'watermark_image', 'authorized_signature_title', 'authorized_signature_image',
        'is_active'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
