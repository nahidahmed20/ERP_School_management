<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasBackup extends Model {
    use HasFactory;

    protected $fillable = [
        'file_name', 'type', 'file_size', 'status', 'disk', 'path', 'checksum', 'encrypted', 'error_message', 'completed_at', 'verified_at', 'created_by','saas_tenant_id'
    ];
    protected $casts=['encrypted'=>'boolean','completed_at'=>'datetime','verified_at'=>'datetime'];
}
