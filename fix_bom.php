<?php
$file = __DIR__ . '/app/Http/Controllers/Admin/CampusController.php';
$content = file_get_contents($file);
// Remove BOM if exists
if (str_starts_with($content, "\xEF\xBB\xBF")) {
    $content = substr($content, 3);
}
// Also just in case there are weird spaces
$content = trim($content);
$content = "<?php\n" . preg_replace('/^<\?php\s*/i', '', $content);
file_put_contents($file, $content);
echo "Fixed CampusController.php";
