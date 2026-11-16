<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class ParentTeacherMeeting extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['requested_at'=>'datetime']; }
