<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GeneratedCertificate extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    public function template()
    {
        return $this->belongsTo(CertificateTemplate::class, 'certificate_template_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }
}
