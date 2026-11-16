<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class ClassDiary extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['date'=>'date']; }
