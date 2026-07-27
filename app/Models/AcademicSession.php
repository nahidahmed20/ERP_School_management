<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicSession extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}
