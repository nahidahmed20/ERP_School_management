<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class AdministrationActivity extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
