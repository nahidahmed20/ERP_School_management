<?php
$file = "app/Console/Commands/SyncGovernmentHolidays.php";
$content = file_get_contents($file);

$content = str_replace(
    "! empty(\$holiday['title'])",
    "(! empty(\$holiday['title']) || ! empty(\$holiday['name']))",
    $content
);
$content = str_replace(
    "\$holiday['title']",
    "(\$holiday['title'] ?? \$holiday['name'] ?? 'Holiday')",
    $content
);

file_put_contents($file, $content);
echo "Updated parser.\n";
