<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class CustomReport extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = [
        'columns' => 'array',
        'filters' => 'array'
    ];
}
