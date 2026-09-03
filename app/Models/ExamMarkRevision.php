<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ExamMarkRevision extends Model { protected $guarded=['id']; protected $casts=['old_values'=>'array','new_values'=>'array']; }
