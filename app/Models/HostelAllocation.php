<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelAllocation extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    protected $casts = ['is_active'=>'boolean','allocation_date'=>'date','checked_in_at'=>'datetime','checked_out_at'=>'datetime'];

    public function room()
    {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bed()
    {
        return $this->belongsTo(HostelBed::class, 'hostel_bed_id');
    }
}
