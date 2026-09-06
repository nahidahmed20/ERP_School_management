<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;
class PaymentAllocation extends Model{use BelongsToCampus;protected$guarded=['id'];protected$casts=['amount'=>'decimal:2','refunded_amount'=>'decimal:2'];public function invoice(){return$this->belongsTo(Invoice::class);}public function payment(){return$this->belongsTo(Payment::class);}public function transaction(){return$this->belongsTo(PaymentTransaction::class,'payment_transaction_id');}}
