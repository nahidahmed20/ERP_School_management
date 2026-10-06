<?php
$file = "resources/js/Pages/Admin/Communication/Events/Index.jsx";
$content = file_get_contents($file);

$content = str_replace(
    "route('communication-calendars.sync-holidays')",
    "route('admin.communication-calendars.sync-holidays')",
    $content
);

file_put_contents($file, $content);
echo "Fixed route name.\n";
