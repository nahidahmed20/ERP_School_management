<?php
$file = "routes/web.php";
$content = file_get_contents($file);

$route = "
Route::get('/create-symlink', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        return 'Storage link created successfully. Please check your images now.';
    } catch (\Exception \$e) {
        return 'Error: ' . \$e->getMessage();
    }
});
";

if (strpos($content, '/create-symlink') === false) {
    file_put_contents($file, $route, FILE_APPEND);
    echo "Added /create-symlink route.\n";
} else {
    echo "Route already exists.\n";
}
