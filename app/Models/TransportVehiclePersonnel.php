<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class TransportVehiclePersonnel extends Model
{
    use BelongsToCampusThrough;

    protected $table = 'transport_vehicle_personnel';
    protected $guarded = ['id'];
    protected $casts = ['assigned_from' => 'date', 'assigned_until' => 'date'];

    protected function campusOwnershipRelation(): string {
        return 'vehicle';
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function transportPersonnel()
    {
        return $this->belongsTo(TransportPersonnel::class);
    }
}


