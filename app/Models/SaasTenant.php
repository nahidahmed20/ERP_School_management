<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaasTenant extends Model {
    use HasFactory;

    protected $fillable = [
        'company_name', 'domain', 'admin_email', 'admin_phone',
        'subscription_plan', 'status', 'valid_until'
        ,'saas_plan_id','tenant_key','domain_verification_token','domain_verified_at','suspended_at','suspension_reason'
    ];

    protected $casts = [
        'valid_until' => 'date',
        'domain_verified_at'=>'datetime','suspended_at'=>'datetime',
    ];
    public function plan(){return $this->belongsTo(SaasPlan::class,'saas_plan_id');}
    public function campuses(){return $this->hasMany(Campus::class);}
}
