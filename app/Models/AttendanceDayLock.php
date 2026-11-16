<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class AttendanceDayLock extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['attendance_date'=>'date','locked_at'=>'datetime']; }
