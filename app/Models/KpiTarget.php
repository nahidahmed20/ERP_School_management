<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class KpiTarget extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = [
        'starts_at' => 'date',
        'ends_at' => 'date',
        'target_value' => 'decimal:2'
    ];
}
