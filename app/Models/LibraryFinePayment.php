<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;class LibraryFinePayment extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['paid_at'=>'datetime'];}
