<?php
namespace App\Models;
use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class ScheduledReport extends Model {
    use BelongsToCampusThrough;
    protected $guarded = ['id'];
    protected $casts = [
        'next_run_at' => 'datetime',
        'last_run_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    protected function campusOwnershipRelation(): string {
        return 'customReport';
    }

    public function customReport() {
        return $this->belongsTo(CustomReport::class);
    }
}
