<?php
$dir = new RecursiveDirectoryIterator("resources/js/Pages/Admin");
$ite = new RecursiveIteratorIterator($dir);

$count = 0;
foreach($ite as $file) {
    if ($file->isFile() && preg_match('/Modal\.jsx$/', $file->getFilename())) {
        $path = $file->getPathname();
        $content = file_get_contents($path);
        
        $updated = str_replace('max-h-[100dvh]', 'max-h-[calc(100dvh-2rem)]', $content);
        
        if ($updated !== $content) {
            file_put_contents($path, $updated);
            $count++;
        }
    }
}
echo "Updated $count modal files to calc(100dvh-2rem).\n";
