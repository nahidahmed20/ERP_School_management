<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class SyllabusTopic extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['planned_date'=>'date','completed_at'=>'datetime']; }
