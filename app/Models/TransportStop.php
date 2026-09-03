<?php
namespace App\Models;use App\Traits\BelongsToCampus;use Illuminate\Database\Eloquent\Model;class TransportStop extends Model{use BelongsToCampus;protected $guarded=['id'];}
