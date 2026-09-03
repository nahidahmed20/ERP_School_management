<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;class VehicleLocation extends Model{protected $guarded=['id'];protected $casts=['recorded_at'=>'datetime'];}
