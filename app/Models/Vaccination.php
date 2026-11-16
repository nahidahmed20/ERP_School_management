<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = []; 

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
