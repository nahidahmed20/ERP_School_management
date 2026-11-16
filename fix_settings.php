<?php

$files = [
    'resources/js/Pages/Admin/General/Index.jsx',
    'resources/js/Pages/Admin/Registry/Index.jsx'
];

foreach($files as $file) {
    if(file_exists($file)) {
        $content = file_get_contents($file);
        $content = preg_replace("/\'Export [^\']+\'/", "'There is no data to export.'", $content);
        $content = preg_replace("/<p className=\"text-sm text-slate-500 mt-1\">[^<]+<\/p>/", "<p className=\"text-sm text-slate-500 mt-1\">Manage system settings and registry configurations securely.</p>", $content);
        file_put_contents($file, $content);
        echo "Fixed $file\n";
    }
}
