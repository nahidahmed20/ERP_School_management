<?php
$file = "resources/css/site.css";
$content = file_get_contents($file);

// Fix desktop logo width
$content = preg_replace(
    '/\.sf-brand img\s*\{\s*width:\s*200;\s*height:\s*48px;\s*\}/',
    ".sf-brand img {\n    max-width: 240px;\n    height: 48px;\n    width: auto;\n    object-fit: contain;\n}",
    $content
);

// Fix mobile logo width
$content = preg_replace(
    '/\.sf-brand img,\s*\.sf-brand i\s*\{\s*width:\s*40px;\s*height:\s*40px\s*\}/',
    ".sf-brand img {\n        max-width: 180px;\n        height: 40px;\n        width: auto;\n        object-fit: contain;\n    }\n    .sf-brand i {\n        width: 40px;\n        height: 40px\n    }",
    $content
);

file_put_contents($file, $content);
echo "Patched site.css for responsive logo\n";
