<?php
$file = "app/Http/Controllers/Admin/SystemRegistryController.php";
$content = file_get_contents($file);

// Fix index scoping
$content = str_replace(
    '$query = SystemLog::with(\'user:id,name\');',
    '$activeCampusId = config(\'app.active_campus_id\');
        $query = SystemLog::with(\'user:id,name\')
            ->where(function($q) use ($activeCampusId) {
                $q->whereHas(\'user\', function($u) use ($activeCampusId) {
                    $u->where(\'campus_id\', $activeCampusId)->orWhereNull(\'campus_id\');
                })->orWhereNull(\'user_id\');
            });',
    $content
);

// Fix destroy
$content = preg_replace(
    "/public function destroy\(SystemLog \\\$log\)/",
    "public function destroy(\$id)",
    $content
);
$content = preg_replace(
    "/\\\$log->delete\(\);(\s+)return back\(\)->with\('success', '[^']+'\);/",
    "\$activeCampusId = config('app.active_campus_id');\n        \$log = SystemLog::where(function(\$q) use (\$activeCampusId) {\n            \$q->whereHas('user', function(\$u) use (\$activeCampusId) {\n                \$u->where('campus_id', \$activeCampusId)->orWhereNull('campus_id');\n            })->orWhereNull('user_id');\n        })->findOrFail(\$id);\n        \$log->delete();\n\n        return back()->with('success', 'Log entry deleted successfully.');",
    $content
);

// Fix clear
$content = preg_replace(
    "/SystemLog::query\(\)->delete\(\);(\s+)return back\(\)->with\('success', '[^']+'\);/",
    "\$activeCampusId = config('app.active_campus_id');\n        SystemLog::where(function(\$q) use (\$activeCampusId) {\n            \$q->whereHas('user', function(\$u) use (\$activeCampusId) {\n                \$u->where('campus_id', \$activeCampusId)->orWhereNull('campus_id');\n            })->orWhereNull('user_id');\n        })->delete();\n\n        return back()->with('success', 'All log entries deleted successfully.');",
    $content
);

file_put_contents($file, $content);
echo "Patched SystemRegistryController";
