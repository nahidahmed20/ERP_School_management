<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasQueueMonitor extends Model {
    use HasFactory;

    protected $fillable = [
        'job_name', 'queue_name', 'status', 'payload',
        'error_message', 'started_at', 'finished_at'
    ];
}
