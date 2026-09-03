<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;class LibraryFinePayment extends Model{protected $guarded=['id'];protected $casts=['paid_at'=>'datetime'];}
