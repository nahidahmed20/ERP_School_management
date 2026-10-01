<?php
$file = "resources/js/Pages/Admin/General/Partials/WebsiteSettingsForm.jsx";
$content = file_get_contents($file);

$content = str_replace(
    "const images = [['logo', 'School logo ?\" website & admin portal'], ['footer_logo', 'Website footer logo'], ['favicon', 'Browser icon (favicon)']];",
    "const images = [['logo', 'Website header logo'], ['footer_logo', 'Website footer logo'], ['admin_logo', 'Admin portal logo'], ['favicon', 'Browser icon (favicon)']];",
    $content
);

$content = str_replace(
    "logo: null, footer_logo: null, favicon: null,",
    "logo: null, footer_logo: null, admin_logo: null, favicon: null,",
    $content
);

$content = str_replace(
    "remove_logo: false, remove_footer_logo: false, remove_favicon: false,",
    "remove_logo: false, remove_footer_logo: false, remove_admin_logo: false, remove_favicon: false,",
    $content
);

file_put_contents($file, $content);
echo "Patched WebsiteSettingsForm.jsx\n";
