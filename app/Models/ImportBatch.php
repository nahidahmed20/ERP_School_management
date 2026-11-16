<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class ImportBatch extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = [
        'errors' => 'array',
        'created_ids' => 'array',
        'rolled_back_at' => 'datetime'
    ];
}
