<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationCms extends Model {
    use HasFactory;

    protected $table = 'communication_cms';

    protected $fillable = [
        'campus_id', 'title', 'slug', 'content_type',
        'content_body', 'featured_image', 'is_published'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
