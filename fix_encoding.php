<?php
$files = [
    "resources/js/Pages/Admin/System/Security/AuditLogs/Index.jsx",
    "resources/js/Pages/Admin/System/Security/Logins/Index.jsx",
    "resources/js/Pages/Admin/System/Security/FailedLogins/Index.jsx",
    "resources/js/Pages/Admin/System/Security/TrustedDevices/Index.jsx"
];

foreach($files as $file) {
    if(!file_exists($file)) continue;
    $content = file_get_contents($file);
    
    // Using preg_replace with generic patterns for non-ASCII
    $content = preg_replace("/'Export [^']+'/", "'There is no data to export.'", $content);
    $content = preg_replace("/<p className=\"text-sm text-slate-500 mt-1\">[^<]+<\/p>/", "<p className=\"text-sm text-slate-500 mt-1\">View detailed history and monitor activities to ensure system security.</p>", $content);
    
    file_put_contents($file, $content);
    echo "Fixed $file\n";
}
