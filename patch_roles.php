<?php
$files = [
    "app/Http/Controllers/Admin/SecurityAuditLogController.php",
    "app/Http/Controllers/Admin/SecurityLoginController.php"
];

foreach($files as $file) {
    if(file_exists($file)) {
        $content = file_get_contents($file);
        $content = str_replace("user:id,name,email,role", "user:id,name,email", $content);
        file_put_contents($file, $content);
        echo "Patched $file\n";
    }
}
