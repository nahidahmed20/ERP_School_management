<?php
$file = "resources/js/Pages/Admin/General/Partials/WebsiteSettingsForm.jsx";
$content = file_get_contents($file);

$content = preg_replace(
    '/const images = \[\[\'logo\',.*?\]\];/',
    "const images = [['logo', 'Website header logo'], ['footer_logo', 'Website footer logo'], ['admin_logo', 'Admin portal logo'], ['favicon', 'Browser icon (favicon)']];",
    $content
);

file_put_contents($file, $content);
echo "Patched WebsiteSettingsForm.jsx again\n";
