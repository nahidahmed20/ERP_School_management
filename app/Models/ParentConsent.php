<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class ParentConsent extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['is_granted'=>'boolean','responded_at'=>'datetime','expires_at'=>'datetime']; public function student(){return $this->belongsTo(Student::class);} public function guardian(){return $this->belongsTo(Guardian::class);} }
