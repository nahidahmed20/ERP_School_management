<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class Designation extends Model
{
    use BelongsToCampus;

    protected $guarded = ['id'];
}
