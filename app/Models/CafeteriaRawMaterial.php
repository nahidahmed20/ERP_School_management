<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class CafeteriaRawMaterial extends Model
{
    use BelongsToCampus;

    protected $guarded = [];

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}