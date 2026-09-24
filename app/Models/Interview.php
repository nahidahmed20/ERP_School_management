<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use BelongsToCampusThrough, HasFactory;

    protected $guarded = ['id'];
    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    protected function campusOwnershipRelation(): string
    {
        return 'applicant';
    }
}
