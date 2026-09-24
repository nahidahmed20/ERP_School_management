<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class MedicalRoom extends Model
{
    use BelongsToCampus;

    protected $guarded = [];
}
