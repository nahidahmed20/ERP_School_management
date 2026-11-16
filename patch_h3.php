<?php
$file = "resources/js/Pages/Auth/Login.jsx";
$content = file_get_contents($file);

$content = str_replace(
    '<h3 className="font-semibold text-base leading-tight" style={{ fontFamily: "\'Fraunces\', serif" }}>',
    '<h3 className="font-semibold text-base leading-tight text-white" style={{ fontFamily: "\'Fraunces\', serif" }}>',
    $content
);

file_put_contents($file, $content);
echo "Added text-white to theme.label h3";
