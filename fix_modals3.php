<?php
$dir = new RecursiveDirectoryIterator("resources/js/Pages/Admin");
$ite = new RecursiveIteratorIterator($dir);

$count = 0;
foreach($ite as $file) {
    if ($file->isFile() && preg_match('/Modal\.jsx$/', $file->getFilename())) {
        $path = $file->getPathname();
        $content = file_get_contents($path);
        
        // Match className attribute containing 'bg-white' and 'shadow-2xl' and 'w-full'
        $updated = preg_replace_callback('/className=["\']([^"\']+)["\']/', function($matches) {
            $classString = $matches[1];
            if (strpos($classString, 'bg-white') !== false && 
                strpos($classString, 'shadow-2xl') !== false && 
                strpos($classString, 'w-full') !== false &&
                strpos($classString, 'max-h-') === false) {
                return 'className="' . $classString . ' max-h-[100dvh] sm:max-h-[90vh]"';
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
