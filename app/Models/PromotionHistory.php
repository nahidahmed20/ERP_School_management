<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PromotionHistory extends Model { protected $guarded=['id']; protected $casts=['rolled_back_at'=>'datetime']; }
