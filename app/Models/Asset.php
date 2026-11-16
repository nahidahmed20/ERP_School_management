<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
