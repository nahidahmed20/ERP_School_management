<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LibraryReservation extends Model { protected $guarded=['id']; protected $casts=['requested_at'=>'date','expires_at'=>'date']; public function book(){return $this->belongsTo(Book::class);} }
