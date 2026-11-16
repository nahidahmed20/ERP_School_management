<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentTaskCompletion extends Model { protected $guarded=['id']; protected $casts=['completed_at'=>'datetime']; }
