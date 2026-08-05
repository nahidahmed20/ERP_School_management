<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyMaterial extends Model {
    use HasFactory;

    protected $fillable = [
        'title', 'class_id', 'subject_id', 'description',
        'file_path', 'file_type', 'uploaded_by'
    ];

    public function schoolClass() {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject() {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function uploader() {
        return $this->belongsTo(User::class, 'uploaded_by'); 
    }
}
