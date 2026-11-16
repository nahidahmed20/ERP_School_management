<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class ClassSubstitution extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['date'=>'date']; }
