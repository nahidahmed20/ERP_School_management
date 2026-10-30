<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostalRecord extends Model
{
    use HasFactory, BelongsToCampus;

    protected $table = 'postal_records';

    protected $guarded = ['id'];
}
