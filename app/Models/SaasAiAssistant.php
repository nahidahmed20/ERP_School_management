<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasAiAssistant extends Model {
    use HasFactory;

    protected $fillable = [
        'name', 'provider', 'model_name', 'system_prompt', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
