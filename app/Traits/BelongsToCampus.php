<?php
namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

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
    }
}