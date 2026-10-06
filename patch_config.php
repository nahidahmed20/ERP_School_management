<?php
$file = "config/services.php";
$content = file_get_contents($file);

$content = str_replace(
    "'feed_url' => env('GOVERNMENT_HOLIDAY_FEED_URL'),",
    "'feed_url' => env('GOVERNMENT_HOLIDAY_FEED_URL', 'https://date.nager.at/api/v3/PublicHolidays/{year}/BD'),",
    $content
);

file_put_contents($file, $content);
echo "Updated config/services.php\n";
