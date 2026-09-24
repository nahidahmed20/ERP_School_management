<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionInquiry extends Model
{
    use BelongsToCampus, HasFactory;

    protected $table = 'admission_inquiries';

    protected $guarded = ['id'];
}
