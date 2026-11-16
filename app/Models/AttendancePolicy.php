<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class AttendancePolicy extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['weekly_holidays'=>'array','block_holiday_entry'=>'boolean','auto_absent_sms'=>'boolean','is_active'=>'boolean']; }
