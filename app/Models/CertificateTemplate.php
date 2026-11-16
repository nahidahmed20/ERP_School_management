<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificateTemplate extends Model {
    use HasFactory, SoftDeletes, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'title', 'template_type', 'content_body',
        'background_image', 'signature_1_title', 'signature_1_image',
        'signature_2_title', 'signature_2_image', 'is_active'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
