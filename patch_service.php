<?php
$file = "app/Services/WebsiteSettingsService.php";
$content = file_get_contents($file);

$content = str_replace(
    "'footer_logo' => null,",
    "'footer_logo' => null,\n        'admin_logo' => null,",
    $content
);

$content = str_replace(
    "foreach (['logo', 'footer_logo', 'favicon'] as \$key) {",
    "foreach (['logo', 'footer_logo', 'admin_logo', 'favicon'] as \$key) {",
    $content
);

file_put_contents($file, $content);
echo "Patched WebsiteSettingsService.php\n";
