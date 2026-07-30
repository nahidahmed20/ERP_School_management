<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date_administered' => 'date',
        'next_due_date' => 'date',
    ];

    public function student() {
        return $this->belongsTo(User::class, 'user_id');
    }
}