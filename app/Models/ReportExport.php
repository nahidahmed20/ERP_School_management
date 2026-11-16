<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;

class ReportExport extends Model {
    use BelongsToCampus;
    protected $guarded = ['id'];
    protected $casts = [
        'exported_at' => 'datetime'
    ];
}
