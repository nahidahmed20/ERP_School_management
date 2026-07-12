<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileManagerFolder extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function parent()
    {
        return $this->belongsTo(FileManagerFolder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(FileManagerFolder::class, 'parent_id');
    }

    public function files()
    {
        return $this->hasMany(FileManagerFile::class, 'folder_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
