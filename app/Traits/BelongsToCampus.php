<?php
namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToCampus
{
    protected static function bootBelongsToCampus()
    {
        static::addGlobalScope('campus', function (Builder $builder) {
            $activeCampusId = config('app.active_campus_id');
            
            if ($activeCampusId) {
                $builder->where($builder->getModel()->qualifyColumn('campus_id'), $activeCampusId);
            }
        });

        static::creating(function (Model $model) {
            // Explicit null represents a central/global record (for example
            // website branding or a Super Admin account), not a missing field.
            if (! array_key_exists('campus_id', $model->getAttributes()) && config('app.active_campus_id')) {
                $model->setAttribute('campus_id', config('app.active_campus_id'));
            }
        });
    }
}
