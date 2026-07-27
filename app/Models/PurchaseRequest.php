<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
