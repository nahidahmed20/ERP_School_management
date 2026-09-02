<?php

namespace App\Support;

class PerPage
{
    /** @var list<int> */
    public const OPTIONS = [10, 25, 50, 100, 500];

    public static function resolve(int $default = 10): int
    {
        if (strtolower((string) request()->input('per_page')) === 'all') {
            return PHP_INT_MAX;
        }

        $requested = request()->integer('per_page', $default);

        return in_array($requested, self::OPTIONS, true) ? $requested : $default;
    }
}
