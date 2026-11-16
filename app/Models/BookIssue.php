<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookIssue extends Model
{
    use HasFactory, BelongsToCampus;

    protected $guarded = ['id'];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function copy(){return $this->belongsTo(BookCopy::class,'book_copy_id');}
    public function member(){return $this->belongsTo(LibraryMember::class,'library_member_id');}
    public function finePayments(){return $this->hasMany(LibraryFinePayment::class);}
}
