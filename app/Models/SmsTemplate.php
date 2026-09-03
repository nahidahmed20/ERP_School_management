<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class SmsTemplate extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['is_active'=>'boolean','auto_send'=>'boolean'];}
