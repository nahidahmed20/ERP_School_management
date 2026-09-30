<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

// Recalculate badge_count for all parents
$parents = MenuItem::whereNull('parent_id')->get();
$fixedCount = 0;

foreach ($parents as $parent) {
    $childCount = MenuItem::where('parent_id', $parent->id)->count();
    
    // Only update if it actually has children
    if ($childCount > 0) {
        if ($parent->badge_count != $childCount) {
            echo "Fixing {$parent->label}: {$parent->badge_count} -> {$childCount}\n";
            $parent->badge_count = $childCount;
            $parent->save();
            $fixedCount++;
        }
    }
}

echo "Fixed {$fixedCount} menu items.\n";
\Illuminate\Support\Facades\Artisan::call('cache:clear');
