<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class TransportPersonnelDocument extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];
    protected $casts = ['expires_at' => 'date'];

    protected function campusOwnershipRelation(): string {
        return 'transportPersonnel';
    }

    public function transportPersonnel()
    {
        return $this->belongsTo(TransportPersonnel::class);
    }
}


