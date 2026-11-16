<?php
$file = "app/Http/Controllers/Admin/SecurityTrustedDeviceController.php";
$content = file_get_contents($file);

$content = str_replace(
    "SecurityTrustedDevice::findOrFail(\$id)->delete();",
    "\$activeCampusId = config('app.active_campus_id');\n        SecurityTrustedDevice::where(function(\$q) use (\$activeCampusId) {\n            \$q->whereHas('user', function(\$u) use (\$activeCampusId) {\n                \$u->where('campus_id', \$activeCampusId)->orWhereNull('campus_id');\n            })->orWhereNull('user_id');\n        })->findOrFail(\$id)->delete();",
    $content
);

file_put_contents($file, $content);
echo "Patched destroy";
