<?php

namespace App\Models;

use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class StudyMaterial extends Model {
    use BelongsToCampus, HasFactory;

    protected $fillable = [
        'title', 'class_id', 'subject_id', 'description',
        'file_path', 'file_type', 'uploaded_by'
    ];

    public function storageDisk(): string
    {
        return Storage::disk('local')->exists($this->file_path) ? 'local' : 'public';
    }

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
