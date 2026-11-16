<?php

namespace App\Support;

class PerPage
{
    /** @var list<int> */
    public const OPTIONS = [10, 25, 50, 100, 500];

    public static function resolve(int $default = 10): int
    {
        $default = in_array($default, self::OPTIONS, true) ? $default : self::OPTIONS[0];
        $input = request()->input('per_page');

        if (is_string($input) && strtolower($input) === 'all') {
            return max(self::OPTIONS);
        }

        $requested = is_scalar($input) ? filter_var($input, FILTER_VALIDATE_INT) : false;

        return in_array($requested, self::OPTIONS, true) ? $requested : $default;
    }
}
