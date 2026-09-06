<?php
namespace App\Models;
use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class StockAdjustmentRequest extends Model{use BelongsToCampus;protected$guarded=['id'];protected$casts=['approved_at'=>'datetime'];public function item(){return$this->belongsTo(PurchaseItem::class,'purchase_item_id');}public function requester(){return$this->belongsTo(User::class,'requested_by');}}
