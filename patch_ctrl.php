<?php
$file = "app/Http/Controllers/Admin/GeneralSettingController.php";
$content = file_get_contents($file);

$content = str_replace(
    "'footer_logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',",
    "'footer_logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',\n            'admin_logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',",
    $content
);

$content = str_replace(
    "'remove_footer_logo' => 'nullable|boolean',",
    "'remove_footer_logo' => 'nullable|boolean',\n            'remove_admin_logo' => 'nullable|boolean',",
    $content
);

$content = str_replace(
    "foreach (['logo', 'footer_logo', 'favicon'] as \$key) {",
    "foreach (['logo', 'footer_logo', 'admin_logo', 'favicon'] as \$key) {",
    $content
);

file_put_contents($file, $content);
echo "Patched GeneralSettingController.php\n";
