<?php
$dir = new RecursiveDirectoryIterator("resources/js/Pages/Admin");
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, '/Modal\.jsx$/', RegexIterator::GET_MATCH);

$count = 0;
foreach($files as $file) {
    $path = $file[0];
    $content = file_get_contents($path);
    
    // Pattern to match the main modal container class string
    // e.g. className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
    
    $updated = preg_replace_callback('/(className=["\'](?:[^"\']*?)bg-white rounded-2xl(?:[^"\']*?)w-full(?:[^"\']*?)flex flex-col(?:[^"\']*?))(["\'])/', function($matches) {
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
echo "Updated $count modal files.\n";
