<?php

namespace App\Models;

use App\Traits\BelongsToCampusThrough;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use BelongsToCampusThrough, HasFactory;

    protected $guarded = ['id'];
    public function copies(){return $this->hasMany(BookCopy::class);}

    protected function campusOwnershipRelation(): string
    {
        return 'copies';
    }
}
