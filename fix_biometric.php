<?php

// Fix BiometricSyncLogController
$file = 'app/Http/Controllers/Admin/BiometricSyncLogController.php';
$content = file_get_contents($file);
$content = str_replace(
    '$query = BiometricSyncLog::with([\'device:id,name\', \'enrolledUser:id,user_name,user_type\']);',
    '$activeCampusId = config(\'app.active_campus_id\');
        $query = BiometricSyncLog::with([\'device:id,name\', \'enrolledUser:id,user_name,user_type\'])
                    ->where(function($q) use ($activeCampusId) {
                        $q->where(\'campus_id\', $activeCampusId)
                          ->orWhereNull(\'campus_id\');
                    });',
    $content
);
file_put_contents($file, $content);

// Fix BiometricEnrolledUserController
$file = 'app/Http/Controllers/Admin/BiometricEnrolledUserController.php';
$content = file_get_contents($file);
$content = str_replace(
    '$query = BiometricEnrolledUser::query();',
    '$activeCampusId = config(\'app.active_campus_id\');
        $query = BiometricEnrolledUser::where(function($q) use ($activeCampusId) {
            $q->where(\'campus_id\', $activeCampusId)
              ->orWhereNull(\'campus_id\');
        });',
    $content
);
$content = str_replace(
    '$enrolled = BiometricEnrolledUser::findOrFail($id);',
    '$enrolled = BiometricEnrolledUser::where(\'campus_id\', config(\'app.active_campus_id\'))->orWhereNull(\'campus_id\')->findOrFail($id);',
    $content
);
$content = str_replace(
    'BiometricEnrolledUser::findOrFail($id)->delete();',
    'BiometricEnrolledUser::where(\'campus_id\', config(\'app.active_campus_id\'))->findOrFail($id)->delete();',
    $content
);
file_put_contents($file, $content);

// Fix BiometricDeviceController
$file = 'app/Http/Controllers/Admin/BiometricDeviceController.php';
$content = file_get_contents($file);
$content = str_replace(
    '$query = BiometricDevice::query();',
    '$activeCampusId = config(\'app.active_campus_id\');
        $query = BiometricDevice::where(function($q) use ($activeCampusId) {
            $q->where(\'campus_id\', $activeCampusId)
              ->orWhereNull(\'campus_id\');
        });',
    $content
);
$content = str_replace(
    '$device = BiometricDevice::findOrFail($id);',
    '$device = BiometricDevice::where(\'campus_id\', config(\'app.active_campus_id\'))->orWhereNull(\'campus_id\')->findOrFail($id);',
    $content
);
$content = str_replace(
    'BiometricDevice::findOrFail($id)->delete();',
    'BiometricDevice::where(\'campus_id\', config(\'app.active_campus_id\'))->findOrFail($id)->delete();',
    $content
);
file_put_contents($file, $content);
echo "Patched biometric controllers successfully";
