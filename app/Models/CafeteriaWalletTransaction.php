<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class CafeteriaWalletTransaction extends Model {use BelongsToCampus;protected $guarded=['id'];protected $casts=['amount'=>'decimal:2','balance_after'=>'decimal:2'];public function wallet(){return $this->belongsTo(CafeteriaWallet::class);}}
