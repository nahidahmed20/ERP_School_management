<?php
$dir = new RecursiveDirectoryIterator("resources/js/Pages/Admin");
$ite = new RecursiveIteratorIterator($dir);

$count = 0;
foreach($ite as $file) {
    if ($file->isFile() && preg_match('/Modal\.jsx$/', $file->getFilename())) {
        $path = $file->getPathname();
        $content = file_get_contents($path);
        
        // Pattern to match the main modal container class string
        // The modal wrapper might not always have flex-col, but usually has bg-white rounded-2xl w-full
        $updated = preg_replace_callback('/(className=["\'](?:[^"\']*?)bg-white rounded-2xl(?:[^"\']*?)w-full(?:[^"\']*?))(["\'])/', function($matches) {
            $classString = $matches[1];
            if (strpos($classString, 'max-h-') === false) {
                return $classString . ' max-h-[100dvh] sm:max-h-[90vh]' . $matches[2];
            }
            return $matches[0];
        }, $content);
        
        if ($updated !== $content) {
            file_put_contents($path, $updated);
            $count++;
        }
    }
}
echo "Updated $count modal files.\n";
