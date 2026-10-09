<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class VisitorLog extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];
}
