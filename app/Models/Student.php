<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use BelongsToCampus, SoftDeletes;
    protected $guarded = [];
    protected $casts = ['status' => 'boolean', 'admission_date' => 'date', 'date_of_birth' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class, 'guardian_id');
    }

    public function guardians()
    {
        return $this->belongsToMany(Guardian::class, 'student_guardians')->withPivot(['relationship','is_primary','can_pickup','receives_sms','receives_email','custody_note'])->withTimestamps();
    }

    public function authorizedPickups()
    {
        return $this->hasMany(StudentAuthorizedPickup::class);
    }

    public function guardianNotes()
    {
        return $this->hasMany(StudentGuardianNote::class);
    }

    public function parentConsents()
    {
        return $this->hasMany(ParentConsent::class);
    }

    public function clearances()
    {
        return $this->hasMany(StudentClearance::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function currentEnrollment()
    {
        return $this->hasOne(Enrollment::class, 'student_id')->where('is_current', true);
    }

    public function campus()
    {
        return $this->belongsTo(Campus::class);
    }

    public function feeAssignments()
    {
        return $this->hasMany(FeeAssignment::class, 'student_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function documents()
    {
        return $this->hasMany(StudentDocument::class, 'student_id');
    }

    public function developmentRecords()
    {
        return $this->hasMany(StudentDevelopmentRecord::class);
    }

}
