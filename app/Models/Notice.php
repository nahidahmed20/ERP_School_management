<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'notice_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
