<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class CommunicationCampaign extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['audience_rules'=>'array','scheduled_at'=>'datetime','approved_at'=>'datetime','completed_at'=>'datetime'];public function deliveries(){return $this->hasMany(CommunicationDelivery::class);}public function segment(){return $this->belongsTo(AudienceSegment::class,'audience_segment_id');}}
