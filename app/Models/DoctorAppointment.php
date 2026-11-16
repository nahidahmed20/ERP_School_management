<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class DoctorAppointment extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected function campusOwnershipRelation(): string
    {
        return 'user';
    }
}
