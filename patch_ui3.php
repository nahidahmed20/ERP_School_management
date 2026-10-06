<?php
$file = "resources/js/Pages/Admin/Communication/Events/Index.jsx";
$content = file_get_contents($file);

$content = str_replace(
    "window.location.href = '/communication-calendars/sync-holidays';",
    "router.post(route('communication-calendars.sync-holidays'));",
    $content
);

file_put_contents($file, $content);
echo "Fixed to router.post\n";
