<?php
$file = ".htaccess";
$content = file_get_contents($file);

$content = str_replace(
    "RewriteRule ^(app|bootstrap|config|database|resources|storage|tests|vendor)(/.*)?$ - [F,L,NC]",
    "RewriteRule ^(app|bootstrap|config|database|resources|tests|vendor)(/.*)?$ - [F,L,NC]",
    $content
);

file_put_contents($file, $content);
echo "Patched .htaccess\n";
