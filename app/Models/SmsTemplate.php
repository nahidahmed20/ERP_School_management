<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;
class SmsTemplate extends Model{protected $guarded=['id'];protected $casts=['is_active'=>'boolean','auto_send'=>'boolean'];}
