<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('attendance:sync')->dailyAt('23:59');
if (config('services.government_holidays.feed_url')) {
    Schedule::command('holidays:sync')->monthlyOn(1, '02:15')->withoutOverlapping();
    Schedule::command('holidays:sync '.(now()->year + 1))->yearlyOn(11, 15, '02:30')->withoutOverlapping();
}
