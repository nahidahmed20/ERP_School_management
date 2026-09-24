<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Restricts a child record through a campus-scoped parent relation.
 *
 * Use this for legacy tables that do not have a campus_id column of their
 * own, but are unambiguously owned by a campus-scoped parent record.
 */
trait BelongsToCampusThrough
{
    protected static function bootBelongsToCampusThrough(): void
    {
        static::addGlobalScope('campus', function (Builder $builder): void {
            if (! config('app.active_campus_id')) {
                return;
            }

            $builder->whereHas($builder->getModel()->campusOwnershipRelation());
        });
    }

    abstract protected function campusOwnershipRelation(): string;
}
