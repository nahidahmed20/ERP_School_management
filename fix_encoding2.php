<?php
$files = [
    "resources/js/Pages/Admin/System/Biometric/Devices/Index.jsx",
    "resources/js/Pages/Admin/System/Biometric/EnrolledUsers/Index.jsx",
    "resources/js/Pages/Admin/System/Biometric/SyncLogs/Index.jsx"
];

foreach($files as $file) {
    if(!file_exists($file)) { echo "Not found: $file\n"; continue; }
    $content = file_get_contents($file);
    
    // Using preg_replace with generic patterns for non-ASCII
    $content = preg_replace("/'Export [^']+'/", "'There is no data to export.'", $content);
    $content = preg_replace("/<p className=\"text-sm text-slate-500 mt-1\">[^<]+<\/p>/", "<p className=\"text-sm text-slate-500 mt-1\">Manage biometric hardware devices and synchronization logs.</p>", $content);
    
    file_put_contents($file, $content);
    echo "Fixed $file\n";
}
