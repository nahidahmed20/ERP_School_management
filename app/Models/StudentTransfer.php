<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class StudentTransfer extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['effective_date'=>'date','approved_at'=>'datetime']; }
