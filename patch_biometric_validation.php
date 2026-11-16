<?php
$file = "app/Http/Controllers/Admin/BiometricEnrolledUserController.php";
$content = file_get_contents($file);

$content = str_replace(
    "\$table = \$validated['user_type'] === 'staff' ? 'staff' : 'students';\n        abort_unless(\DB::table(\$table)->where('id', \$validated['user_id'])->where('campus_id', \$validated['campus_id'])->exists(), 422, 'Selected user does not belong to the active campus.');",
    "\$table = \$validated['user_type'] === 'staff' ? 'staff' : 'students';\n        if (!\DB::table(\$table)->where('id', \$validated['user_id'])->where('campus_id', \$validated['campus_id'])->exists()) {\n            throw \Illuminate\Validation\ValidationException::withMessages([\n                'user_id' => 'Selected user ID does not belong to the active campus for this user type.',\n            ]);\n        }",
    $content
);

file_put_contents($file, $content);
echo "Patched validation error.";
