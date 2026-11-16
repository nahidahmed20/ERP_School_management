<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class StudentBoardingAttendance extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = ['trip_date' => 'date', 'event_at' => 'datetime'];

    protected function campusOwnershipRelation(): string {
        return 'transportAllocation';
    }

    public function transportAllocation()
    {
        return $this->belongsTo(TransportAllocation::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}


