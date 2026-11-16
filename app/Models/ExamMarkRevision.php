<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class ExamMarkRevision extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['old_values'=>'array','new_values'=>'array']; }
