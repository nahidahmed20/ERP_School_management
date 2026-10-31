<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TranslationEntry extends Model
{
    protected $fillable = ['source_key', 'english_text', 'bangla_text'];
}
