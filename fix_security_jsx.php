<?php

$dirs = [
    'resources/js/Pages/Admin/System/Security',
    'resources/js/Pages/Admin/System/Biometric'
];

foreach($dirs as $d) {
    if(!is_dir($d)) continue;
    $dir = new RecursiveDirectoryIterator($d);
    $ite = new RecursiveIteratorIterator($dir);
    $files = new RegexIterator($ite, '/^.+\.jsx$/i', RecursiveRegexIterator::GET_MATCH);

    foreach($files as $file) {
        $filePath = $file[0];
        $content = file_get_contents($filePath);
        
        $newContent = preg_replace("/\'Export [^\']+\'/", "'There is no data to export.'", $content);
        $newContent = preg_replace("/<p className=\"text-sm text-slate-500 mt-1\">[^<]+<\/p>/", "<p className=\"text-sm text-slate-500 mt-1\">Manage security logs and configurations.</p>", $newContent);
        
        if($content !== $newContent) {
            file_put_contents($filePath, $newContent);
            echo "Fixed $filePath\n";
        }
    }
}
