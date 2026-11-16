<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class PromotionHistory extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['rolled_back_at'=>'datetime']; }
