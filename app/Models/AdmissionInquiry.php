<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionInquiry extends Model
{
    use HasFactory;

    protected $table = 'admission_inquiries';

    protected $guarded = ['id'];
}