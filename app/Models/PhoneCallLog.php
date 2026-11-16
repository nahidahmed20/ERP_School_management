<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhoneCallLog extends Model
{
    use HasFactory, BelongsToCampus;

    protected $table = 'phone_call_logs';

    protected $guarded = ['id'];
}