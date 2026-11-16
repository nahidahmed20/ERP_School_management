<?php
namespace App\Models;
use App\Traits\BelongsToCampus;
use Illuminate\Database\Eloquent\Model;
class OfficialDocument extends Model { use BelongsToCampus; protected $guarded=['id']; protected $casts=['issue_date'=>'date','field_values'=>'array']; public function template(){return $this->belongsTo(OfficialDocumentTemplate::class,'official_document_template_id');} }
