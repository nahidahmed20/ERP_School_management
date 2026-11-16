<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Model;

class MedicalConsent extends Model
{
    use BelongsToCampusThrough;

    protected $guarded = ['id'];

    public function student()
    {
        return $this->belongsTo(User::class);
    }

    protected function campusOwnershipRelation(): string
    {
        return 'student';
    }
}
