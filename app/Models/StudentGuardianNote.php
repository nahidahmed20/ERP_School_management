<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentGuardianNote extends Model { protected $guarded=['id']; protected $casts=['is_confidential'=>'boolean']; }
