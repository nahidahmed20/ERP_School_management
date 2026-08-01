<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowCustomField extends Model {
    use HasFactory;

    protected $fillable = [
        'campus_id', 'target_model', 'field_label', 'field_name',
        'field_type', 'options', 'is_required', 'is_active'
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
