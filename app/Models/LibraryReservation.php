<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCampus;

class LibraryReservation extends Model {
    use BelongsToCampus;

    protected $guarded=['id'];
    protected $casts=['requested_at'=>'date','expires_at'=>'date'];

    public function book(){return $this->belongsTo(Book::class);}
    public function user(){return $this->belongsTo(User::class);}
}
