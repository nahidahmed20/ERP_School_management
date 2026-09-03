<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowApproval extends Model {
    use HasFactory, BelongsToCampus;

    protected $fillable = [
        'campus_id', 'title', 'type', 'requester_name',
        'details', 'status', 'approval_chain'
    ];

    protected $casts = [
        'approval_chain' => 'array',
    ];

    public function campus() { return $this->belongsTo(Campus::class); }
}
