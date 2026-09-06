<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdCardTemplate extends Model {
    use HasFactory, SoftDeletes, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'title', 'audience', 'layout_type', 'design_template', 'text_align', 'photo_align', 'field_labels', 'theme_color',
        'logo_image', 'signature_image', 'background_image',
        'show_blood_group', 'show_address', 'show_phone',
        'back_side_content', 'is_active'
    ];
    protected $casts=['field_labels'=>'array','show_blood_group'=>'boolean','show_address'=>'boolean','show_phone'=>'boolean','is_active'=>'boolean'];

    public function campus() { return $this->belongsTo(Campus::class); }
}
