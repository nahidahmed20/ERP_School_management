<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdCardTemplate extends Model {
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campus_id', 'title', 'layout_type', 'theme_color',
        'logo_image', 'signature_image', 'background_image',
        'show_blood_group', 'show_address', 'show_phone',
        'back_side_content', 'is_active'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
