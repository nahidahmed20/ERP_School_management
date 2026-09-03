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
                $builder->where('campus_id', $activeCampusId);
            }
        });

        static::creating(function (Model $model) {
            if (! $model->getAttribute('campus_id') && config('app.active_campus_id')) {
                $model->setAttribute('campus_id', config('app.active_campus_id'));
            }
        });
    }
}
