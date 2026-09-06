<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    use BelongsToCampus;
    protected $guarded = [];

    protected $casts = [
        'date_administered' => 'date',
        'next_due_date' => 'date',
    ];

    public function student() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
