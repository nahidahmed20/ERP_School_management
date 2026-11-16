<?php
$file = "resources/js/Pages/Auth/Register.jsx";
$content = file_get_contents($file);

$content = str_replace(
    "'1 month free, no card needed',",
    "dynamicText?.feature_3 || '1 month free, no card needed',",
    $content
);

file_put_contents($file, $content);
echo "Patched feature_3 in Register.jsx";
