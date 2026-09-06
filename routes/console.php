<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('attendance:sync')->everyMinute()->withoutOverlapping();
Schedule::command('attendance:notify-absent')->dailyAt('11:00')->withoutOverlapping()->onOneServer();
Schedule::command('communications:dispatch')->everyMinute()->withoutOverlapping()->onOneServer();
Schedule::command('library:overdues')->dailyAt('08:00')->withoutOverlapping()->onOneServer();
Schedule::command('medical:vaccination-reminders')->dailyAt('08:30')->withoutOverlapping()->onOneServer();
Schedule::command('reports:deliver')->everyFifteenMinutes()->withoutOverlapping()->onOneServer();
Schedule::command('fees:generate')->dailyAt('00:15')->withoutOverlapping()->onOneServer();
Schedule::command('backup:secure')->dailyAt('01:30')->withoutOverlapping()->onOneServer();
Schedule::command('queue:prune-failed --hours=336')->dailyAt('03:00')->withoutOverlapping()->onOneServer();
if (config('services.government_holidays.feed_url')) {
    Schedule::command('holidays:sync')->monthlyOn(1, '02:15')->withoutOverlapping();
    Schedule::command('holidays:sync '.(now()->year + 1))->yearlyOn(11, 15, '02:30')->withoutOverlapping();
}
