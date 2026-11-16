<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class OfficialDocumentTemplate extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['is_active'=>'boolean']; public function documents(){return $this->hasMany(OfficialDocument::class);} }
