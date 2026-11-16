<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentProfileUpdateRequest extends Model { protected $guarded=['id']; protected $casts=['changes'=>'array']; public function student(){return $this->belongsTo(Student::class);} }
