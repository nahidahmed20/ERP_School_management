<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $guarded = ['id'];

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}
