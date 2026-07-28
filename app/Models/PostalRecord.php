<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostalRecord extends Model
{
    use HasFactory;

    protected $table = 'postal_records';

    protected $guarded = ['id'];
}
