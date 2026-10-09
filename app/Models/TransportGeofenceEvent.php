<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class TransportGeofenceEvent extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = ['event_at' => 'datetime', 'guardian_notified' => 'boolean'];

    protected function campusOwnershipRelation(): string {
        return 'vehicle';
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function transportStop()
    {
        return $this->belongsTo(TransportStop::class);
    }
}


