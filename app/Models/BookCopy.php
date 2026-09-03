<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;class BookCopy extends Model{use BelongsToCampus;protected $guarded=['id'];protected $casts=['acquired_at'=>'date'];public function book(){return $this->belongsTo(Book::class);}}
