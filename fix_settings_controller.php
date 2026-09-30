<?php
$file = "app/Http/Controllers/Admin/GeneralSettingController.php";
$content = file_get_contents($file);

// Fix update
$content = preg_replace(
    "/public function update\(Request \\\$request, Setting \\\$setting\)/",
    "public function update(Request \$request, \$id)",
    $content
);
$content = preg_replace(
    "/\\\$data = \\\$this->validateData\(\\\$request, \\\$setting->id\);(\s+)\\\$setting->update\(\\\$data\);/",
    "\$setting = Setting::where('campus_id', config('app.active_campus_id'))->orWhereNull('campus_id')->findOrFail(\$id);\n        \$data = \$this->validateData(\$request, \$setting->id);\n        \$setting->update(\$data);",
    $content
);

// Fix destroy
$content = preg_replace(
    "/public function destroy\(Setting \\\$setting\)/",
    "public function destroy(\$id)",
    $content
);
$content = preg_replace(
    "/\\\$setting->delete\(\);(\s+)app\(WebsiteSettingsService::class\)->clearCache\(\);/",
    "\$setting = Setting::where('campus_id', config('app.active_campus_id'))->findOrFail(\$id);\n        \$setting->delete();\n        app(WebsiteSettingsService::class)->clearCache();",
    $content
);

// Fix store mangled text
$content = preg_replace("/return back\(\)->with\('success', '[^']+'\);/", "return back()->with('success', 'Operation completed successfully.');", $content);

// Fix validateData campus injection
$content = str_replace(
    "\$campusId = \$request->campus_id ?? config('app.active_campus_id');",
    "\$campusId = config('app.active_campus_id');\n        \$request->merge(['campus_id' => \$campusId]);",
    $content
);

file_put_contents($file, $content);
echo "Patched GeneralSettingController";
