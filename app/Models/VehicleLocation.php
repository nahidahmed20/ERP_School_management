<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class VehicleLocation extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    protected $casts = ['recorded_at' => 'datetime'];

    protected function campusOwnershipRelation(): string {
        return 'vehicle';
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

