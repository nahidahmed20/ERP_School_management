<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class AudienceSegment extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['rules'=>'array','is_active'=>'boolean'];}
