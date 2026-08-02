<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasScheduledTask extends Model {
    use HasFactory;

    protected $fillable = [
        'name', 'command', 'frequency', 'last_run_at',
        'next_run_at', 'last_status', 'is_active'
    ];

}
