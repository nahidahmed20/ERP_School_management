<?php

function patchController($path, $modelClass, $hasUserRelation = true) {
    if (!file_exists($path)) return;
    $content = file_get_contents($path);
    
    // Add scoping to index
    if ($hasUserRelation) {
        $search = '$query = '.$modelClass.'::with(\'user';
        $replace = '$activeCampusId = config(\'app.active_campus_id\');
        $query = '.$modelClass.'::with(\'user';
        
        if (strpos($content, $search) !== false) {
            $content = str_replace($search, $replace, $content);
            $content = preg_replace(
                "/(with\('user[^']*'\);)/",
                "$1\n        \$query->where(function(\$q) use (\$activeCampusId) {\n            \$q->whereHas('user', function(\$u) use (\$activeCampusId) {\n                \$u->where('campus_id', \$activeCampusId)->orWhereNull('campus_id');\n            })->orWhereNull('user_id');\n        });",
                $content
            );
        }
    }
    
    file_put_contents($path, $content);
    echo "Patched $path\n";
}

patchController('app/Http/Controllers/Admin/SecurityAuditLogController.php', 'SecurityAuditLog', true);
patchController('app/Http/Controllers/Admin/SecurityLoginController.php', 'SecurityLoginHistory', true);
patchController('app/Http/Controllers/Admin/SecurityTrustedDeviceController.php', 'SecurityTrustedDevice', true);
// SecurityFailedLogin has no user relation, skipping scope for it.

