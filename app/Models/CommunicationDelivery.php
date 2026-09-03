<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;
class CommunicationDelivery extends Model{protected $guarded=['id'];protected $casts=['delivered_at'=>'datetime','failed_at'=>'datetime'];public function campaign(){return $this->belongsTo(CommunicationCampaign::class,'communication_campaign_id');}}
