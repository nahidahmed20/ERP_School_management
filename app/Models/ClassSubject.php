<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class ClassSubject extends Model
{
    use BelongsToCampus;

    protected $table = 'class_subject';

    protected $guarded = [];
}
