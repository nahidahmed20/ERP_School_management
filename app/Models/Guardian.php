<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->hasOne(User::class, 'guardian_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'guardian_id');
    }
}
