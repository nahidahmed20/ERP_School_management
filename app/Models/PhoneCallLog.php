<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhoneCallLog extends Model
{
    use HasFactory;

    protected $table = 'phone_call_logs';

    protected $guarded = ['id'];
}