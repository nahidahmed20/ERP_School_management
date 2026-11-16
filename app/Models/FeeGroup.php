<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeGroup extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function feeTypes()
    {
        return $this->hasMany(FeeType::class);
    }

    public function feeAssignments()
    {
        return $this->hasMany(FeeAssignment::class, 'fee_group_id');
    }
}
