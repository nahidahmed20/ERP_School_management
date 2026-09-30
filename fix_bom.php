<?php
$files = [
    "app/Http/Controllers/Auth/RegisteredUserController.php",
    "app/Http/Controllers/Admin/TenantSubscriptionController.php",
    "resources/js/Pages/Auth/Register.jsx",
    "resources/js/Pages/Admin/Subscription/Index.jsx"
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        // Remove UTF-8 BOM if present
        if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
            $content = substr($content, 3);
            file_put_contents($file, $content);
            echo "Removed BOM from $file\n";
        }
    }
}
