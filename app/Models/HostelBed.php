<?php
namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class HostelBed extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    public function room()
    {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }

    protected function campusOwnershipRelation(): string
    {
        return 'room';
    }
}
