<?php
$file = "database/seeders/MenuSeeder.php";
$content = file_get_contents($file);

$content = str_replace(
    "'badge_count'   => \$item['count'] ?? null,",
    "'badge_count'   => isset(\$item['children']) ? count(\$item['children']) : null,",
    $content
);

file_put_contents($file, $content);
echo "Replaced badge_count in MenuSeeder";
