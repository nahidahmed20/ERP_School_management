<?php

$dir = new RecursiveDirectoryIterator('resources/js/Pages/Admin/SaaS');
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, '/^.+\.jsx$/i', RecursiveRegexIterator::GET_MATCH);

foreach($files as $file) {
    $filePath = $file[0];
    $content = file_get_contents($filePath);
    
    // Replace mangled Export alert text
    $content = preg_replace("/\'Export [^\']+\'/", "'There is no data to export.'", $content);
    
    // Replace mangled paragraph text under titles
    $content = preg_replace("/<p className=\"text-sm text-slate-500 mt-1\">[^<]+<\/p>/", "<p className=\"text-sm text-slate-500 mt-1\">Manage SaaS operations securely.</p>", $content);
    
    file_put_contents($filePath, $content);
    echo "Fixed $filePath\n";
}
