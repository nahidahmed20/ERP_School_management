<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CafeteriaWalletTransaction extends Model {protected $guarded=['id'];protected $casts=['amount'=>'decimal:2','balance_after'=>'decimal:2'];public function wallet(){return $this->belongsTo(CafeteriaWallet::class);}}
