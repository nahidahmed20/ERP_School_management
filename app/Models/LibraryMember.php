<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;class LibraryMember extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['valid_until'=>'date','is_active'=>'boolean'];public function user(){return $this->belongsTo(User::class);}}
