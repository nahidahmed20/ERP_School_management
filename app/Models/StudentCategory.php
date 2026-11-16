<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class StudentCategory extends Model
{
    use BelongsToCampus;

    protected $guarded = [];
}
