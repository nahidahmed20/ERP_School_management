<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class StudentGuardianNote extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['is_confidential' => 'boolean'];
}
