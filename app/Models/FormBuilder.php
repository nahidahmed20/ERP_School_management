<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FormBuilder extends Model {
    use HasFactory, SoftDeletes;

    protected $fillable = ['campus_id', 'title', 'description', 'form_schema', 'is_published'];

    protected $casts = [
        'form_schema' => 'array',
        'is_published' => 'boolean',
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
