<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class VehicleMaintenanceLog extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = ['service_date' => 'date', 'next_due_date' => 'date'];

    protected function campusOwnershipRelation(): string {
        return 'vehicle';
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}


