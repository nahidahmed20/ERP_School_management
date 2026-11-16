<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicSession extends Model
{
    use BelongsToCampus, HasFactory;

    protected $guarded = ['id'];

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}
