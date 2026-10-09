<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class HostelAttendance extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    public function hostelAllocation()
    {
        return $this->belongsTo(HostelAllocation::class);
    }

    protected function campusOwnershipRelation(): string
    {
        return 'hostelAllocation';
    }
}

