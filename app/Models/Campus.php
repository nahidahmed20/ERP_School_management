<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campus extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_main' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function academicSessions()
    {
        return $this->hasMany(AcademicSession::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
