<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use BelongsToCampus, HasFactory;

    protected $guarded = ['id'];

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class);
    }
}
