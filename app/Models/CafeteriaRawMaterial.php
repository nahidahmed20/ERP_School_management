<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CafeteriaRawMaterial extends Model
{
    protected $guarded = [];

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}