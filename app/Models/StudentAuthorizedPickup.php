<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class StudentAuthorizedPickup extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['is_active'=>'boolean','valid_until'=>'date','verified_at'=>'datetime']; public function student(){return $this->belongsTo(Student::class);} }
