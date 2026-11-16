<?php
$file = "app/Http/Controllers/Admin/Communication/EventController.php";
$content = file_get_contents($file);

$syncMethod = "
    public function syncHolidays()
    {
        try {
            \Illuminate\Support\Facades\Artisan::call('holidays:sync');
            return redirect()->back()->with('success', 'Government holidays synced successfully!');
        } catch (\Exception \$e) {
            return redirect()->back()->with('error', 'Failed to sync holidays: ' . \$e->getMessage());
        }
    }
";

// Insert before the closing brace of the class
$content = preg_replace('/}(?!.*})/', $syncMethod . "\n}", $content);
file_put_contents($file, $content);
echo "Added syncHolidays method.\n";
