<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class HostelBed extends Model { use BelongsToCampus; protected $guarded=['id']; public function room(){return $this->belongsTo(HostelRoom::class,'hostel_room_id');} }
