<?php

namespace App\Support;

use Illuminate\Validation\Rule;

class CampusRule
{
    public static function exists(string $table, string $column = 'id')
    {
        return Rule::exists($table, $column)
            ->where(fn ($query) => $query->where('campus_id', config('app.active_campus_id')));
    }
}
