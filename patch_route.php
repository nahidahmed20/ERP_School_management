<?php
$file = "routes/web.php";
$content = file_get_contents($file);

$search = "Route::resource('communication-calendars', EventController::class);";
$replace = "Route::post('communication-calendars/sync-holidays', [EventController::class, 'syncHolidays'])->name('communication-calendars.sync-holidays');\n    Route::resource('communication-calendars', EventController::class);";

$content = str_replace($search, $replace, $content);
file_put_contents($file, $content);
echo "Added route.\n";
