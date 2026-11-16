<?php
namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class TransportStop extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    protected function campusOwnershipRelation(): string {
        return 'transportRoute';
    }

    public function transportRoute()
    {
        return $this->belongsTo(TransportRoute::class);
    }
}

