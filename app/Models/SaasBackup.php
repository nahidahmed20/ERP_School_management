<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasBackup extends Model {
    use HasFactory;

    protected $fillable = [
        'file_name', 'type', 'file_size', 'status'
    ];
}
