<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class TransportFeeCharge extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = ['paid_at' => 'datetime'];

    protected function campusOwnershipRelation(): string {
        return 'transportAllocation';
    }

    public function transportAllocation()
    {
        return $this->belongsTo(TransportAllocation::class);
    }
}


