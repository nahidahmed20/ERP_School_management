<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunicationPreference extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'is_opted_in' => 'boolean',
        'changed_at' => 'datetime'
    ];

    public function recipient()
    {
        return $this->morphTo();
    }
}

